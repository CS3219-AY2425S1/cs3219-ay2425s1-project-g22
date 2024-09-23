import { Request, Response } from "express";
import { querySchema, createSchema } from "../validations/querySchema.js";

class QuestionController {
  async get(req: Request, res: Response) {
    const validation = querySchema.safeParse(req.query);

    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.format() });
    }

    const { id, c, d } = validation.data;

    res.status(200).json(`Questions filtered by: id: ${id}, c: ${c}, d: ${d}`);
  }

  async create(req: Request, res: Response) {
    const validation = createSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.format() });
    }

    const { title, desc, c, d } = validation.data;

    res.status(201).json(
      `Question created with: 
        title: ${title}, 
        desc: ${desc}, 
        category: ${c}, 
        difficulty: ${d}`
    );
  }

  async update(req: Request, res: Response) {
    // ...
  }

  async delete(req: Request, res: Response) {
    // ...
  }
}

export const questionController = new QuestionController();
