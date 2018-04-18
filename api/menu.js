const express = require('express');
const sqlite3 = require('sqlite3');

const dbUtils = require('./dbUtils');
const menuItemRouter = require('./menuItem');

const menuRouter = express.Router();
menuRouter.use('/:menuId/menu-items', menuItemRouter);

// const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite',
//             (err) => {
//                 if (err) {
//                     console.log('Error connecting/opening database Menu...', err);
//                 } else {
//                     console.log('Successfully conected to in-memory database - Menu...')
//                 }
//             });

menuRouter.get('/', async (req, res, next) => {
    const query = `SELECT *
                    FROM
                        Menu;`;
    const allMenu = await dbUtils.getAll(query);
    if (allMenu.err) {
        next(allMenu.err);
    } else {
        res.status(200).json({menus:allMenu.data});
    }
});

menuRouter.post('/', async (req, res, next) => {
    const newMenu = req.body.menu;
    const {title} = newMenu;

    if (!title) {
        res.sendStatus(400);
        return;
    }

    const query = `INSERT
                    INTO
                        Menu
                            (title)
                        VALUES
                            ($title);`;
    const values = {
        $title: title
    }

    const postResults = await dbUtils.insertOne(query,values);
    if (postResults.err) {
        next(postResults.err);
    } else {
        const createdMenu = await dbUtils.selectOne('Menu', 'id', postResults.lastID);
        if (createdMenu.err) {
            next(createdMenu.err);
        } else {
            res.status(201).json({menu:createdMenu.data});
        }
    }
});

dbUtils.routerParam(menuRouter, 'Menu', 'menu');

menuRouter.get('/:id', async (req, res, next) => {
    const menuId = Number(req.params.id);
    const menuExists = await dbUtils.selectOne('Menu', 'id', menuId);
    if (menuExists.err) {
        next(menuExists.err);
    } else {
        if (!menuExists.data) {
            res.sendStatus(404);
        } else {
            res.status(200).json({menu:menuExists.data});
        }
    }
});

menuRouter.put('/:id', async (req, res, next) => {
    const menuId = Number(req.params.id);
    const menuUpdate = req.body.menu;
    const {title} = menuUpdate;

    if (!dbUtils.isValid(title)) {
        res.sendStatus(400);
        return;
    }

    const query = `UPDATE
                        Menu
                    SET
                        title=$title
                    WHERE
                        id=$id;`;
    const values = {
        $id: menuId,
        $title: title
    };

    const menuExists = await dbUtils.selectOne('Menu', 'id', menuId);
    if (menuExists.err) {
        next(menuExists.err);
    } else {
        if (!menuExists.data) {
            res.sendStatus(400);
        } else {
            const updateResults = await dbUtils.updateOne(query, values);
            if (updateResults.err) {
                next(updateResults.err);
            } else {
                const updatedMenu = await dbUtils.selectOne('Menu', 'id', menuId);
                if (updatedMenu.err) {
                    next(updatedMenu.err);
                } else {
                    res.status(200).json({menu:updatedMenu.data});
                }
            }
        }
    }
});

menuRouter.delete('/:id', async (req, res, next) => {
    const menuId = Number(req.params.id);

    const hasMenuItem = await dbUtils.selectOne('MenuItem', 'menu_id', menuId);
    if (hasMenuItem.data) {
        res.sendStatus(400);
        return;
    }

    const menuExists = await dbUtils.selectOne('Menu', 'id', menuId);
    if (menuExists.err) {
        next(menuExists.err);
    } else {
        if (!menuExists.data) {
            res.sendStatus(400)
        } else {
            const deleteResults = await dbUtils.deleteOne('Menu', 'id', menuId);
            if (deleteResults.err) {
                next(deleteResults.err);
            } else {
                res.status(204).json({menu:menuExists.data});
            }
        }
    }
});

module.exports = menuRouter;