import { Response } from 'express';
import { AuthRequest } from './auth-controller';
import Board from '../models/board-model';
import List from '../models/list-model';
import Card from '../models/card-model';
import User from '../models/user-model';
import { asyncHandler } from '../utils/async-handler';
import { ApiError } from '../utils/api-error';
import { ApiResponse } from '../utils/api-response';

//   Create a new board
export const createBoard = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { title, description, background_color, background_image } = req.body;

    if (!title) {
        throw new ApiError(400, "Board title is required");
    }

    const board = await Board.create({
        title,
        description,
        background_color,
        background_image,
        owner: req.user?._id,
        members: [req.user?._id],
    });

    console.log(`[BOARD] Created "${board.title}" by user ${req.user?._id}`);

    return res.status(201).json(
        new ApiResponse(201, board, "Board created successfully")
    );
});

//    Get all boards for the logged-in user (ONLY their own)
export const getBoards = asyncHandler(async (req: AuthRequest, res: Response) => {
    const boards = await Board.find({
        $or: [{ owner: req.user?._id }, { members: req.user?._id }],
    }).populate('owner', 'full_name email avatar');

    console.log(`[BOARD] User ${req.user?._id} fetched ${boards.length} boards`);

    return res.status(200).json(
        new ApiResponse(200, boards, "Boards fetched successfully")
    );
});

//    Get board by ID (only if user is owner or member)
export const getBoardById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const board = await Board.findById(req.params.id)
        .populate('owner', 'full_name email avatar')
        .populate('members', 'full_name email avatar');

    if (!board) {
        throw new ApiError(404, "Board not found");
    }

    // Check if the user is the owner or a member of this board
    const userId = req.user?._id.toString();
    const isOwner = board.owner._id.toString() === userId;
    const isMember = board.members.some((m: any) => m._id.toString() === userId);

    if (!isOwner && !isMember) {
        throw new ApiError(403, "You don't have access to this board");
    }

    return res.status(200).json(
        new ApiResponse(200, board, "Board fetched successfully")
    );
});

//     Update board (only owner)
export const updateBoard = asyncHandler(async (req: AuthRequest, res: Response) => {
    const board = await Board.findById(req.params.id);

    if (!board) {
        throw new ApiError(404, "Board not found");
    }

    if (board.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Only the board owner can update this board");
    }

    const updatedBoard = await Board.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    console.log(`[BOARD] Updated "${updatedBoard?.title}" by user ${req.user?._id}`);

    return res.status(200).json(
        new ApiResponse(200, updatedBoard, "Board updated successfully")
    );
});

//     Delete board + all its lists and cards (only owner)
export const deleteBoard = asyncHandler(async (req: AuthRequest, res: Response) => {
    const board = await Board.findById(req.params.id);

    if (!board) {
        throw new ApiError(404, "Board not found");
    }

    if (board.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Only the board owner can delete this board");
    }

    // Cascade delete: remove all cards and lists belonging to this board
    await Card.deleteMany({ board_id: board._id });
    await List.deleteMany({ board_id: board._id });
    await board.deleteOne();

    console.log(`[BOARD] Deleted board "${board.title}" + cascaded lists/cards by user ${req.user?._id}`);

    return res.status(200).json(
        new ApiResponse(200, {}, "Board and all related data deleted successfully")
    );
});

//    Toggle star on board for user (owner or member)
export const toggleStarBoard = asyncHandler(async (req: AuthRequest, res: Response) => {
    const board = await Board.findById(req.params.id);

    if (!board) {
        throw new ApiError(404, "Board not found");
    }

    const userId = req.user?._id;
    const userIdStr = userId.toString();

    // Verify user owns/belongs to this board
    const isOwner = board.owner.toString() === userIdStr;
    const isMember = board.members.some((m: any) => m.toString() === userIdStr);

    if (!isOwner && !isMember) {
        throw new ApiError(403, "You don't have access to this board");
    }

    // Toggle logic
    const isStarred = board.starredBy.some((id: any) => id.toString() === userIdStr);
    if (isStarred) {
        // Unstar
        board.starredBy = board.starredBy.filter((id: any) => id.toString() !== userIdStr) as any;
    } else {
        // Star
        board.starredBy.push(userId);
    }

    await board.save();

    console.log(`[BOARD] User ${userIdStr} toggled star on board ${board._id}. Now starred: ${!isStarred}`);

    return res.status(200).json(
        new ApiResponse(200, board, `Board ${!isStarred ? 'starred' : 'unstarred'} successfully`)
    );
});

// @desc    Add member to board by email
// @route   POST /api/boards/:id/members
export const addBoardMember = asyncHandler(async (req: AuthRequest, res: Response) => {
    const board = await Board.findById(req.params.id);
    if (!board) {
        throw new ApiError(404, "Board not found");
    }

    // Only owner can add members
    if (board.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Only the board owner can add members to this board");
    }

    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, "User email is required");
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
        throw new ApiError(404, "User with this email not found");
    }

    const userIdStr = userToAdd._id.toString();

    // Check if user is already owner or member
    if (board.owner.toString() === userIdStr) {
        throw new ApiError(400, "User is the owner of this board");
    }

    if (board.members.some(id => id.toString() === userIdStr)) {
        throw new ApiError(400, "User is already a member of this board");
    }

    board.members.push(userToAdd._id);
    await board.save();

    const populatedBoard = await Board.findById(board._id)
        .populate('owner', 'full_name email avatar')
        .populate('members', 'full_name email avatar');

    console.log(`[BOARD] Added member ${userToAdd.email} to board ${board.title}`);

    return res.status(200).json(
        new ApiResponse(200, populatedBoard, "Member added successfully")
    );
});

//     Remove member from board
//    DELETE /api/boards/:id/members/:memberId
export const removeBoardMember = asyncHandler(async (req: AuthRequest, res: Response) => {
    const board = await Board.findById(req.params.id);
    if (!board) {
        throw new ApiError(404, "Board not found");
    }

    const { memberId } = req.params;
    const userIdStr = req.user?._id.toString();

    // Only owner can remove members, or the member themselves can leave
    const isOwner = board.owner.toString() === userIdStr;
    const isLeaving = memberId === userIdStr;

    if (!isOwner && !isLeaving) {
        throw new ApiError(403, "You do not have permission to remove this member");
    }

    // Cannot remove owner
    if (memberId === board.owner.toString()) {
        throw new ApiError(400, "Cannot remove the board owner");
    }

    // Check if user is a member
    if (!board.members.some(id => id.toString() === memberId)) {
        throw new ApiError(400, "User is not a member of this board");
    }

    // Remove member
    board.members = board.members.filter(id => id.toString() !== memberId);
    await board.save();

    // Cascade: remove user from card members array in all cards of this board
    await Card.updateMany(
        { board_id: board._id },
        { $pull: { members: memberId } }
    );

    const populatedBoard = await Board.findById(board._id)
        .populate('owner', 'full_name email avatar')
        .populate('members', 'full_name email avatar');

    console.log(`[BOARD] Removed member ${memberId} from board ${board.title}`);

    return res.status(200).json(
        new ApiResponse(200, populatedBoard, "Member removed successfully")
    );
});
