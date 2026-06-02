import { Router } from "express";
import { createList, getListsByBoard, updateList, deleteList, reorderLists } from "../controllers/list-controller";
import { protect } from "../middleware/auth-middleware";

const router = Router();

router.use(protect);

/**
 * @swagger
 * /api/lists/reorder:
 *   post:
 *     summary: Reorder lists in a board
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - boardId
 *               - lists
 *             properties:
 *               boardId:
 *                 type: string
 *               lists:
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
 *         description: Lists reordered successfully
 */
router.post("/reorder", reorderLists);

/**
 * @swagger
 * /api/lists:
 *   post:
 *     summary: Create a new list in a board
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - board_id
 *             properties:
 *               name:
 *                 type: string
 *               board_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: List created successfully
 *       400:
 *         description: List name and board_id are required
 */
router.post("/", createList);

/**
 * @swagger
 * /api/lists/board/{board_id}:
 *   get:
 *     summary: Get all lists belonging to a board
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: board_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Board ID
 *     responses:
 *       200:
 *         description: List of board lists returned
 */
router.get("/board/:board_id", getListsByBoard);

/**
 * @swagger
 * /api/lists/{id}:
 *   put:
 *     summary: Update a list details (e.g. name)
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: List ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: List updated successfully
 *   delete:
 *     summary: Delete a list
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: List ID
 *     responses:
 *       200:
 *         description: List deleted successfully
 */
router.route("/:id")
    .put(updateList)
    .delete(deleteList);

export default router;
