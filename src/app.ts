import * as express from "express";
import {Request, Response} from "express";
import {createConnection} from "typeorm";
import {User} from "./entity/User";
import {Project} from "./entity/Project";
import * as redis from 'redis'

// create typeorm connection
createConnection().then(connection => {
    const userRepository = connection.getRepository(User);
    const projectRepository = connection.getRepository(Project);
    // create and setup express app
    const app = express();
    app.use(express.json());

    // register routes

    app.get("/users", async function(req: Request, res: Response) {
        const users = await userRepository.find();
        res.json(users);
    });

    app.get("/users/:id", async function(req: Request, res: Response) {
        const results = await userRepository.findOne(req.params.id, {relations: ['projects']});
        return res.send(results);
    });

    app.post("/users", async function(req: Request, res: Response) {
        let users = [];
        let singleObj = {
            "firstName": "",
            "lastName": "",
            "std": 0,
            "projects": [] as any[]
        }

        let proj = {
            "name" : ""
        }

        for (let i=0; i <= 10; i++) {
            singleObj.firstName = "first" + i;
            singleObj.lastName = "last" + i;
            singleObj.std = i;
            proj.name = "proj" + i;
            singleObj.projects.push(proj);
            users.push(singleObj);
        }

        const userdataset = await userRepository.create(users);
        //const project = await projectRepository.create(req.body.projects);
        const results = await userRepository.save(userdataset);
        return res.send(results); 
    });


    app.put("/users/:id", async function(req: Request, res: Response) {
        const user = await userRepository.findOne(req.params.id);
        userRepository.merge(user!, req.body);
        const results = await userRepository.save(user!);
        return res.send(results);
    });

    app.delete("/users/:id", async function(req: Request, res: Response) {
        const results = await userRepository.delete(req.params.id);
        return res.send(results);
    });

    // start express server
    app.listen(3005);
}); 


