const express = require('express');
const sqlite3 = require('sqlite3');
const menuItemRouter = express.Router({mergeParams: true});

const dbUtils = require('./dbUtils');

// ************** begin routes implementation ***************

menuItemRouter.get('/', async (req, res,next) => {
    const menuId = Number(req.params.menuId);

    const menuExists = await dbUtils.selectOne("Menu", `id=${menuId}`);
    if (menuExists.err) {
        next(menuExists.err);
    } else {
        if (!menuExists.data) {
            res.sendStatus(404);
            return;
        } else {
            const allMenuItems = await dbUtils.getAll('MenuItem', 'menu_id', menuId);            
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
    const newMenuItem = req.body.menuItem;
    const {name, description, inventory, price} = req.body.menuItem;

    if (!dbUtils.isValid(name, description, inventory, price)) {
        res.sendStatus(400);
        return;
    }

    const values = {
        $name: name,
        $description: description,
        $inventory: Number(inventory),
        $price: Number(price),
        $menu_id: menuId
    };

    // console.log('MENU ID>>>', menuId);
    const menuExists = await dbUtils.selectOne('Menu', `id=${menuId}`);
    // console.log('MENU EXISTS>>>', menuExists);
    if (menuExists.err) {
        next(menuExists.err);
    } else {
        if (!menuExists.data) {
            res.sendStatus(404);
        } else {
            const postResults = await dbUtils.insertOne('MenuItem', values);
            if (postResults.err) {
                next(postResults.err);
            } else {
                const createdMenuItem = await dbUtils.selectOne('MenuItem', `id=${postResults.lastID}`);
                if (createdMenuItem.err) {
                    next(createdMenuItem.err);
                } else {
                    res.status(201).json({menuItem:createdMenuItem.data});
                }
            }
        }
    }
});

dbUtils.routerParam(menuItemRouter, 'MenuItem', 'menuItem');

menuItemRouter.put('/:id', async (req, res,next) => {
    const menuId = Number(req.params.menuId);
    const menuItemId = Number(req.params.id);
    const {name, description, inventory, price} = req.body.menuItem;
    // made a mistake: was using req.menuItem instead

    const values = {
        // $id: menuItemId,
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price
    };
    const predicate = `id=${menuItemId};`;

    if (!dbUtils.isValid(name, description, inventory, price)) {
        res.sendStatus(400);
        return;
    }

    const menuItemExists = await dbUtils.selectOne('MenuItem', `id=${menuItemId}`);
    if (menuItemExists.err) {
        next(menuItemExists.err);
    } else {
        if (!menuItemExists.data) {
            res.sendStatus(404);
        } else {
            const updateResults = await dbUtils.updateOne('MenuItem', values, predicate);
            if (updateResults.err) {
                next(updateResults.err);
            } else {
                const updatedMenuItem = await dbUtils.selectOne('MenuItem', `id=${menuItemId}`);
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
    const predicate = `id = ${menuItemId}`;

    const menuItemExists = await dbUtils.selectOne('MenuItem', 'id', menuItemId);
    if (menuItemExists.err) {
        next(menuItemExists.err);
    } else {
        if (!menuItemExists.data) {
            res.sendStatus(404);
        } else {
            deleteResults = await dbUtils.deleteOne('MenuItem', predicate);
            if (deleteResults.err) {
                next(deleteResults.err);
            } else {
                res.status(204).json({menuItem:menuItemExists.data});
            }
        }
    }
});

module.exports = menuItemRouter;