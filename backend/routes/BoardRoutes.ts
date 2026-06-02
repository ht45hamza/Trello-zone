import { Router } from "express";
import { 
    createBoard, 
    getBoards, 
    getBoardById, 
    updateBoard, 
    deleteBoard, 
    toggleStarBoard,
    addBoardMember,
    removeBoardMember
} from "../controllers/BoardController";
import { protect } from "../middleware/AuthMiddleware";

const router = Router();

router.use(protect); // All board routes are protected

/**
 * @swagger
 * /api/boards:
 *   post:
 *     summary: Create a new board
 *     tags: [Boards]
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
 *             properties:
 *               name:
 *                 type: string
 *               background:
 *                 type: string
 *     responses:
 *       201:
 *         description: Board created successfully
 *       400:
 *         description: Board name is required
 *   get:
 *     summary: Get all boards of the logged-in user
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of boards returned
 */
router.route("/")
    .post(createBoard)
    .get(getBoards);

/**
 * @swagger
 * /api/boards/{id}:
 *   get:
 *     summary: Get a board by ID (with its lists and cards)
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Board ID
 *     responses:
 *       200:
 *         description: Board details returned
 *       404:
 *         description: Board not found
 *   put:
 *     summary: Update a board details
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Board ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               background:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Board updated successfully
 *   delete:
 *     summary: Delete a board
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Board ID
 *     responses:
 *       200:
 *         description: Board deleted successfully
 */
router.route("/:id")
    .get(getBoardById)
    .put(updateBoard)
    .delete(deleteBoard);

/**
 * @swagger
 * /api/boards/{id}/star:
 *   put:
 *     summary: Toggle star status on a board
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Board ID
 *     responses:
 *       200:
 *         description: Star status toggled successfully
 */
router.put("/:id/star", toggleStarBoard);

/**
 * @swagger
 * /api/boards/{id}/members:
 *   post:
 *     summary: Add a member to a board by email
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Board ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Member added successfully
 *       400:
 *         description: User already member or owner
 *       404:
 *         description: User not found
 */
router.post("/:id/members", addBoardMember);

/**
 * @swagger
 * /api/boards/{id}/members/{memberId}:
 *   delete:
 *     summary: Remove a member from a board
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Board ID
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member (User) ID to remove
 *     responses:
 *       200:
 *         description: Member removed successfully
 */
router.delete("/:id/members/:memberId", removeBoardMember);

export default router;
