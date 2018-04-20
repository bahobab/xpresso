const express = require('express');
const sqlite3 = require('sqlite3');

const dbUtils = require('./dbUtils');
const menuItemRouter = require('./menuItem');

const menuRouter = express.Router();
menuRouter.use('/:menuId/menu-items', menuItemRouter);

// ************** begin routes implementation ***************

menuRouter.get('/', async (req, res, next) => {
   
    const allMenu = await dbUtils.getAll('Menu');
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

    const values = {
        $title: title
    }

    const postResults = await dbUtils.insertOne('Menu', values);
    if (postResults.err) {
        next(postResults.err);
    } else {
        const createdMenu = await dbUtils.selectOne('Menu', `id=${postResults.lastID}`);
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
    const predicate = `id=${menuId}`;

    const menuExists = await dbUtils.selectOne('Menu', predicate);
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

    const values = {
        // $id: menuId,
        $title: title
    };
    const predicate = `id=${menuId};`

    const menuExists = await dbUtils.selectOne('Menu', `id=${menuId}`);
    if (menuExists.err) {
        next(menuExists.err);
    } else {
        if (!menuExists.data) {
            res.sendStatus(400);
        } else {
            const updateResults = await dbUtils.updateOne('Menu', values, predicate);
            if (updateResults.err) {
                next(updateResults.err);
            } else {
                const updatedMenu = await dbUtils.selectOne('Menu', `id=${menuId}`);
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
    const predicate = `id=${menuId}`;

    const hasMenuItem = await dbUtils.selectOne('MenuItem', `menu_id=${menuId}`);
    if (hasMenuItem.data) {
        res.sendStatus(400);
        return;
    }

    const menuExists = await dbUtils.selectOne('Menu', `id=${menuId}`);
    if (menuExists.err) {
        next(menuExists.err);
    } else {
        if (!menuExists.data) {
            res.sendStatus(400)
        } else {
            const deleteResults = await dbUtils.deleteOne('Menu', predicate);
            if (deleteResults.err) {
                next(deleteResults.err);
            } else {
                res.status(204).json({menu:menuExists.data});
            }
        }
    }
});

module.exports = menuRouter;