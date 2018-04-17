const express = require('express');
const sqlite3 = require('sqlite3');

const menuItemRouter = express.Router({mergeParams: true});

const dbUtils = require('./dbUtils');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite',
        err => {
            if (err) {
                console.log('Error connecting to MenuItem');
            } else {
                console.log('Successfully connected to in-memory database - MenuItem...');
            }
});

menuItemRouter.get('/', async (req, res,next) => {
    const menuId = Number(req.params.menuId);
    const queryMenuItem = `SELECT *
                            FROM
                                MenuItem
                            WHERE
                                menu_id=${menuId};`;
    const value = {$menuId: menuId};

    
    const menuExists = await dbUtils.selectOne(db, "Menu", 'id', menuId);
    if (menuExists.err) {
        next(menuExists.err);
    } else {
        if (!menuExists.data) {
            res.sendStatus(404);
            return;
        } else {
            const allMenuItems = await dbUtils.getAll(db, queryMenuItem);            
            if (allMenuItems.err) {
                next(allMenuItems.err);
            } else {
                res.status(200).send({menuItems:allMenuItems.data});
            }
            
        }
    }
});

menuItemRouter.post('/', async (req, res, next) => {
    const menuId = Number(req.params.menuId);
    // console.log('NEW MENUITEM>>>>', req.body);
    const newMenuItem = req.body.menuItem;
    const {name, description, inventory, price} = req.body.menuItem;

    if (!dbUtils.isValid(name, description, inventory, price)) {
        res.sendStatus(400);
        return;
    }

    const query = `INSERT INTO
                        MenuItem
                        (name, description, inventory, price, menu_id)
                    VALUES
                        ($name, $description, $inventory, $price, $menu_id);`;
    
    const values = {
        $name: name,
        $description: description,
        $inventory: Number(inventory),
        $price: Number(price),
        $menu_id: menuId
    };

    const menuExists = await dbUtils.selectOne(db, 'Menu', 'id', menuId);
    if (menuExists.err) {
        next(menuExists.err);
    } else {
        if (!menuExists.data) {
            res.sendStatus(404);
        } else {
            const postResults = await dbUtils.insertOne(db, query, values);
            if (postResults.err) {
                next(postResults.err);
            } else {
                const createdMenuItem = await dbUtils.selectOne(db, 'MenuItem', 'id', postResults.lastID);
                if (createdMenuItem.err) {
                    next(createdMenuItem.err);
                } else {
                    res.status(201).json({menuItem:createdMenuItem.data});
                }
            }
        }
    }
});

dbUtils.routerParam(db, menuItemRouter, 'MenuItem', 'menuItem');

menuItemRouter.put('/:id', async (req, res,next) => {
    const menuId = Number(req.params.menuId);
    const menuItemId = Number(req.params.id);
    const {name, description, inventory, price} = req.body.menuItem;
    // made a mistake: was using req.menuItem instead

    const query = `UPDATE
                        MenuItem
                    SET
                        name=$name,
                        description=$description,
                        inventory=$inventory,
                        price=$price
                    WHERE
                        id=$id;`;
    const values = {
        $id: menuItemId,
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price
    }

    if (!dbUtils.isValid(name, description, inventory, price)) {
        res.sendStatus(400);
        return;
    }

    const menuItemExists = await dbUtils.selectOne(db, 'MenuItem', 'id', menuItemId);
    if (menuItemExists.err) {
        next(menuItemExists.err);
    } else {
        if (!menuItemExists.data) {
            res.sendStatus(404);
        } else {
            const updateResults = await dbUtils.updateOne(db, query, values);
            if (updateResults.err) {
                next(updateResults.err);
            } else {
                const updatedMenuItem = await dbUtils.selectOne(db, 'MenuItem', 'id', menuItemId);
                if (updatedMenuItem.err) {
                    next(updatedMenuItem.err);
                } else {
                    res.status(200).json({menuItem:updatedMenuItem.data});
                }
            }
        }
    }
});

menuItemRouter.delete('/:id', async (req, res, next) => {
    const menuItemId = Number(req.params.id);
    const menuItemExists = await dbUtils.selectOne(db, 'MenuItem', 'id', menuItemId);
    if (menuItemExists.err) {
        next(menuItemExists.err);
    } else {
        if (!menuItemExists.data) {
            res.sendStatus(404);
        } else {
            deleteResults = await dbUtils.deleteOne(db, 'MenuItem', 'id', menuItemId);
            if (deleteResults.err) {
                next(deleteResults.err);
            } else {
                res.status(204).json({menuItem:menuItemExists.data});
            }
        }
    }
});


module.exports = menuItemRouter;