import express from "express";
import { StatusCodes } from "http-status-codes";

const Router = express.Router();

Router.route("/")
    .get((req, res) => {
        res.status(StatusCodes.OK).json({
            message: "Api get list board",
        });
    })
    .post((req, res) => {
        res.status(StatusCodes.CREATED).json({
            message: "Api create new board",
        });
    });

export const boardRoutes = Router;
