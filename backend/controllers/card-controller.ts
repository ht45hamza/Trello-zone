import { Response } from 'express';
import { AuthRequest } from './auth-controller';
import Card from '../models/card-model';
import Board from '../models/board-model';
import List from '../models/list-model';
import { asyncHandler } from '../utils/async-handler';
import { ApiError } from '../utils/api-error';
import { ApiResponse } from '../utils/api-response';
import { uploadOnCloudinary } from '../utils/cloudinary';

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

//    Create a new card
export const createCard = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { title, description, list_id, board_id, position } = req.body;

    if (!title || !list_id || !board_id) {
        throw new ApiError(400, "Title, List ID, and Board ID are required");
    }

    await verifyBoardAccess(board_id, req.user?._id.toString());

    const card = await Card.create({
        title,
        description,
        list_id,
        board_id,
        position,
    });

    console.log(`[CARD] Created "${card.title}" in list ${list_id} by user ${req.user?._id}`);

    return res.status(201).json(
        new ApiResponse(201, card, "Card created successfully")
    );
});

//     Get cards by list ID
export const getCardsByList = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { list_id } = req.params;

    if (!list_id) {
        throw new ApiError(400, "List ID is required");
    }

    const list = await List.findById(list_id);
    if (!list) {
        throw new ApiError(404, "List not found");
    }

    await verifyBoardAccess(list.board_id.toString(), req.user?._id.toString());

    const cards = await Card.find({ list_id }).populate('members', 'full_name email avatar').sort('position');

    return res.status(200).json(
        new ApiResponse(200, cards, "Cards fetched successfully")
    );
});

//    Get card by ID
export const getCardById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const card = await Card.findById(req.params.id)
        .populate('members', 'full_name email avatar')
        .populate('list_id', 'title');

    if (!card) {
        throw new ApiError(404, "Card not found");
    }

    await verifyBoardAccess(card.board_id.toString(), req.user?._id.toString());

    return res.status(200).json(
        new ApiResponse(200, card, "Card fetched successfully")
    );
});

//   Update card
export const updateCard = asyncHandler(async (req: AuthRequest, res: Response) => {
    const card = await Card.findById(req.params.id);

    if (!card) {
        throw new ApiError(404, "Card not found");
    }

    await verifyBoardAccess(card.board_id.toString(), req.user?._id.toString());

    const updatedCard = await Card.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).populate('members', 'full_name email avatar');

    console.log(`[CARD] Updated "${updatedCard?.title}" by user ${req.user?._id}`);

    return res.status(200).json(
        new ApiResponse(200, updatedCard, "Card updated successfully")
    );
});

//    Delete card
export const deleteCard = asyncHandler(async (req: AuthRequest, res: Response) => {
    const card = await Card.findById(req.params.id);

    if (!card) {
        throw new ApiError(404, "Card not found");
    }

    await verifyBoardAccess(card.board_id.toString(), req.user?._id.toString());

    await card.deleteOne();

    console.log(`[CARD] Deleted "${card.title}" by user ${req.user?._id}`);

    return res.status(200).json(
        new ApiResponse(200, {}, "Card removed successfully")
    );
});

//     Move card (Update list and position)
export const moveCard = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { card_id, new_list_id, new_position } = req.body;

    if (!card_id || !new_list_id) {
        throw new ApiError(400, "Card ID and New List ID are required");
    }

    const card = await Card.findById(card_id);
    if (!card) {
        throw new ApiError(404, "Card not found");
    }

    const newList = await List.findById(new_list_id);
    if (!newList) {
        throw new ApiError(404, "New List not found");
    }

    // Ensure user has access to BOTH the original board and the destination board (they should be the same, but just in case)
    await verifyBoardAccess(card.board_id.toString(), req.user?._id.toString());
    await verifyBoardAccess(newList.board_id.toString(), req.user?._id.toString());

    const updatedCard = await Card.findByIdAndUpdate(
        card_id,
        { list_id: new_list_id, position: new_position },
        { new: true }
    ).populate('members', 'full_name email avatar');

    console.log(`[CARD] Moved "${updatedCard?.title}" to list ${new_list_id} by user ${req.user?._id}`);

    return res.status(200).json(
        new ApiResponse(200, updatedCard, "Card moved successfully")
    );
});

// @desc    Get all cards for a board
export const getCardsByBoard = asyncHandler(async (req: AuthRequest, res: Response) => {
    const board_id = String(req.query.board_id);

    if (!board_id) {
        throw new ApiError(400, "Board ID is required");
    }

    await verifyBoardAccess(board_id, req.user?._id.toString());

    const cards = await Card.find({ board_id: board_id }).populate('members', 'full_name email avatar').sort('position');

    return res.status(200).json(
        new ApiResponse(200, cards, "Board cards fetched successfully")
    );
});

// @desc    Add an activity (checklist item) to a card
export const addActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { title } = req.body;
    if (!title) throw new ApiError(400, "Activity title is required");

    const card = await Card.findById(req.params.id);
    if (!card) throw new ApiError(404, "Card not found");

    await verifyBoardAccess(card.board_id.toString(), req.user?._id.toString());

    let pictureUrl = '';
    if (req.file?.path) {
        const uploadResult = await uploadOnCloudinary(req.file.path);
        if (uploadResult) {
            pictureUrl = uploadResult.url;
        }
    }

    card.activities.push({ title, is_completed: false, picture: pictureUrl });
    await card.save();
    await card.populate('members', 'full_name email avatar');

    console.log(`[CARD] Added activity "${title}" to card ${card._id} by user ${req.user?._id}`);

    return res.status(200).json(
        new ApiResponse(200, card, "Activity added successfully")
    );
});

//    Update an activity in a card (e.g. toggle completion or edit title)
export const updateActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { activity_id } = req.params;
    const { title, is_completed } = req.body;

    const card = await Card.findById(req.params.id);
    if (!card) throw new ApiError(404, "Card not found");

    await verifyBoardAccess(card.board_id.toString(), req.user?._id.toString());

    const activity = card.activities.find((act: any) => act._id.toString() === activity_id);
    if (!activity) throw new ApiError(404, "Activity not found");

    if (title !== undefined) activity.title = title;
    if (is_completed !== undefined) activity.is_completed = is_completed;

    await card.save();
    await card.populate('members', 'full_name email avatar');

    return res.status(200).json(
        new ApiResponse(200, card, "Activity updated successfully")
    );
});

//    Delete an activity from a card
export const deleteActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { activity_id } = req.params;

    const card = await Card.findById(req.params.id);
    if (!card) throw new ApiError(404, "Card not found");

    await verifyBoardAccess(card.board_id.toString(), req.user?._id.toString());

    card.activities = card.activities.filter((act: any) => act._id.toString() !== activity_id) as any;
    await card.save();
    await card.populate('members', 'full_name email avatar');

    return res.status(200).json(
        new ApiResponse(200, card, "Activity deleted successfully")
    );
});

//     Reorder multiple cards
export const reorderCards = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { items } = req.body; // Array of { _id, position, list_id }
    if (!Array.isArray(items)) throw new ApiError(400, "Items array is required");

    for (const item of items) {
        await Card.findByIdAndUpdate(item._id, {
            position: item.position,
            ...(item.list_id && { list_id: item.list_id })
        });
    }

    return res.status(200).json(new ApiResponse(200, {}, "Cards reordered successfully"));
});
