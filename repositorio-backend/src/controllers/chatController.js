import * as chatService from '../services/chat.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const postChat = asyncHandler(async (req, res) => {
  const { question } = req.body;
  const result = await chatService.answerQuestion(typeof question === 'string' ? question : '');
  res.json(result);
});
