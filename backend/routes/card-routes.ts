import { Router } from "express";
import { createCard, getCardsByList, getCardById, updateCard, deleteCard, moveCard, getCardsByBoard, addActivity, updateActivity, deleteActivity, reorderCards } from "../controllers/card-controller";
import { protect } from "../middleware/auth-middleware";

import { upload } from "../middleware/multer-middleware";

const router = Router();

router.use(protect);

/**
 * @swagger
 * /api/cards/reorder:
 *   post:
 *     summary: Reorder cards in a list
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listId
 *               - cards
 *             properties:
 *               listId:
 *                 type: string
 *               cards:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     position:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Cards reordered successfully
 */
router.post("/reorder", reorderCards);

/**
 * @swagger
 * /api/cards:
 *   post:
 *     summary: Create a new card in a list
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - list_id
 *             properties:
 *               title:
 *                 type: string
 *               list_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Card created successfully
 *       400:
 *         description: Card title and list_id are required
 */
router.post("/", createCard);

/**
 * @swagger
 * /api/cards/move:
 *   post:
 *     summary: Move a card between lists
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cardId
 *               - sourceListId
 *               - targetListId
 *               - position
 *             properties:
 *               cardId:
 *                 type: string
 *               sourceListId:
 *                 type: string
 *               targetListId:
 *                 type: string
 *               position:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Card moved successfully
 */
router.post("/move", moveCard);

/**
 * @swagger
 * /api/cards/board/all:
 *   get:
 *     summary: Get all cards belonging to a board
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: board_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Board ID
 *     responses:
 *       200:
 *         description: List of board cards returned
 */
router.get("/board/all", getCardsByBoard);

/**
 * @swagger
 * /api/cards/list/{list_id}:
 *   get:
 *     summary: Get all cards in a list
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: list_id
 *         required: true
 *         schema:
 *           type: string
 *         description: List ID
 *     responses:
 *       200:
 *         description: List of list cards returned
 */
router.get("/list/:list_id", getCardsByList);

/**
 * @swagger
 * /api/cards/{id}:
 *   get:
 *     summary: Get details of a single card
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Card ID
 *     responses:
 *       200:
 *         description: Card details returned
 *       404:
 *         description: Card not found
 *   put:
 *     summary: Update card details
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Card ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               cover_color:
 *                 type: string
 *               list_id:
 *                 type: string
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Card updated successfully
 *   delete:
 *     summary: Delete a card
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Card ID
 *     responses:
 *       200:
 *         description: Card deleted successfully
 */
router.route("/:id")
    .get(getCardById)
    .put(updateCard)
    .delete(deleteCard);

/**
 * @swagger
 * /api/cards/{id}/activities:
 *   post:
 *     summary: Add activity or comment with optional picture attachment to a card
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Card ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *               picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Activity added successfully
 */
router.post("/:id/activities", upload.single('picture'), addActivity);

/**
 * @swagger
 * /api/cards/{id}/activities/{activity_id}:
 *   put:
 *     summary: Update activity comment text
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Card ID
 *       - in: path
 *         name: activity_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Activity ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Activity updated successfully
 *   delete:
 *     summary: Delete an activity from a card
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Card ID
 *       - in: path
 *         name: activity_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Activity ID
 *     responses:
 *       200:
 *         description: Activity deleted successfully
 */
router.route("/:id/activities/:activity_id")
    .put(updateActivity)
    .delete(deleteActivity);

export default router;
