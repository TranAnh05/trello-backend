import express from "express";
import { StatusCodes } from "http-status-codes";
import { boardValidation } from "../../validations/boardValidation.js";

const Router = express.Router();

Router.route("/")
    .get((req, res) => {
        res.status(StatusCodes.OK).json({
            message: "Api get list board",
        });
    })
    .post(boardValidation.createNew);

export const boardRoutes = Router;
