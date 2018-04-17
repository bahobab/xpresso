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

module.exports = menuItemRouter;