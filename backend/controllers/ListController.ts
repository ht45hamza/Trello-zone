import { Response } from 'express';
import { AuthRequest } from './AuthController';
import List from '../models/ListModel';
import Board from '../models/BoardModel';
import Card from '../models/CardModel';
import { asyncHandler } from '../utils/AsyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';

// Helper: verify user has access to the board
const verifyBoardAccess = async (boardId: string, userId: string) => {
    const board = await Board.findById(boardId);
    if (!board) throw new ApiError(404, "Board not found");

    const isOwner = board.owner.toString() === userId;
    const isMember = board.members.some((m: any) => m.toString() === userId);

    if (!isOwner && !isMember) {
        throw new ApiError(403, "You don't have access to this board");
    }
    return board;
};

//     Create a new list
export const createList = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { title, board_id, position } = req.body;

    if (!title || !board_id) {
        throw new ApiError(400, "Title and Board ID are required");
    }

    // Verify user owns/belongs to this board
    await verifyBoardAccess(board_id, req.user?._id.toString());

    const list = await List.create({
        title,
        board_id,
        position,
    });

    console.log(`[LIST] Created "${list.title}" in board ${board_id} by user ${req.user?._id}`);

    return res.status(201).json(
        new ApiResponse(201, list, "List created successfully")
    );
});

//    Get lists by board ID (only if user has access)
export const getListsByBoard = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { board_id } = req.params;

    if (!board_id) {
        throw new ApiError(400, "Board ID is required");
    }

    // Verify user owns/belongs to this board
    await verifyBoardAccess(board_id as string, req.user?._id.toString());

    const lists = await List.find({ board_id }).sort('position');

    console.log(`[LIST] User ${req.user?._id} fetched ${lists.length} lists for board ${board_id}`);

    return res.status(200).json(
        new ApiResponse(200, lists, "Lists fetched successfully")
    );
});

//    Update list (only if user has board access)
export const updateList = asyncHandler(async (req: AuthRequest, res: Response) => {
    const list = await List.findById(req.params.id);

    if (!list) {
        throw new ApiError(404, "List not found");
    }

    // Verify user owns/belongs to the board this list is in
    await verifyBoardAccess(list.board_id.toString(), req.user?._id.toString());

    const updatedList = await List.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    console.log(`[LIST] Updated "${updatedList?.title}" by user ${req.user?._id}`);

    return res.status(200).json(
        new ApiResponse(200, updatedList, "List updated successfully")
    );
});

//  Delete list + all its cards (only if user has board access)
export const deleteList = asyncHandler(async (req: AuthRequest, res: Response) => {
    const list = await List.findById(req.params.id);

    if (!list) {
        throw new ApiError(404, "List not found");
    }

    // Verify user owns/belongs to the board this list is in
    await verifyBoardAccess(list.board_id.toString(), req.user?._id.toString());

    // Cascade: delete all cards in this list
    await Card.deleteMany({ list_id: list._id });
    await list.deleteOne();

    console.log(`[LIST] Deleted list "${list.title}" + its cards by user ${req.user?._id}`);

    return res.status(200).json(
        new ApiResponse(200, {}, "List and its cards removed successfully")
    );
});

//    Reorder multiple lists
export const reorderLists = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { items } = req.body; // Array of { _id, position }
    if (!Array.isArray(items)) throw new ApiError(400, "Items array is required");

    for (const item of items) {
        await List.findByIdAndUpdate(item._id, { position: item.position });
    }

    return res.status(200).json(new ApiResponse(200, {}, "Lists reordered successfully"));
});
