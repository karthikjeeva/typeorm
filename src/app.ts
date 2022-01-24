import * as express from "express";
import {Request, Response} from "express";
import {createConnection} from "typeorm";
import {User} from "./entity/User";
import {Project} from "./entity/Project";
import * as redis from 'redis';

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
        try {
            const client = redis.createClient();

            client.on('error', (err) => console.log('Redis Client Error', err));
        
            await client.connect();
            let alreadyCached = await  client.get('users')
            if ( alreadyCached) {
                let cachedUserData = JSON.parse(alreadyCached);
                return res.send(cachedUserData);
            } else {
                const results = await userRepository.findOne(req.params.id, {relations: ['projects']});
                await client.setEx('users',3600, JSON.stringify(results));
                return res.send(results);
            }
          
        } catch(err) {
            console.log("error connecting  to redis " + err);
        }
      
       
    });

    app.post("/users", async function(req: Request, res: Response) {
        let users = [];
       

        for (let i=0; i <= 150; i++) {
            let singleObj = {
                "firstName": "",
                "lastName": "",
                "std": 0,
                "projects": [] as any[]
            }
    
            let proj = {
                "name" : ""
            }
            singleObj.firstName = "first" + i;
            singleObj.lastName = "last" + i;
            singleObj.std = i;
            proj.name = "proj" + i;
            for (let j = 0; j <= 5; j++) {
                singleObj.projects.push(proj);
            }
            
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


