const express = require('express');
const sqlite3 = require('sqlite3');

const dbUtils = require('./dbUtils');
const menuItemRouter = require('./menuItem');

const menuRouter = express.Router();
menuRouter.use('/:menuId/menu-items', menuItemRouter);

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite',
            (err) => {
                if (err) {
                    console.log('Error connecting/opening database Menu...', err);
                } else {
                    console.log('Successfully conected to in-memory database - Menu...')
                }
            });

// menuRouter.get('/', async (req, res, next) => {
//     const query = `SELECT *
//                     FROM
//                         Menu;`;
//     const allMenu = await dbUtils.getAll(db, query);
//     if (allMenu.err) {
//         next(allMenu.err);
//     } else {
//         res.status(200).json({menus:allMenu.data});
//     }
// });

// menuRouter.post('/', async (req, res, next) => {
//     // console.log('NEW MENU>>>>', req.body);
//     const newMenu = req.body.menu;
//     const {title} = newMenu;

//     if (!title) {
//         res.sendStatus(400);
//         return;
//     }

//     const query = `INSERT
//                     INTO
//                         Menu
//                             (title)
//                         VALUES
//                             ($title);`;
//     const values = {
//         $title: title
//     }

//     const postResults = await dbUtils.insertOne(db, query,values);
//     if (postResults.err) {
//         next(postResults.err);
//     } else {
//         const createdMenu = await dbUtils.selectOne(db, 'Menu', 'id', postResults.lastID);
//         if (createdMenu.err) {
//             next(createdMenu.err);
//         } else {
//             res.status(201).json({menu:createdMenu.data});
//         }
//     }
// });

// dbUtils.routerParam(db, menuRouter, 'Menu', 'menu');

// menuRouter.get('/:id', async (req, res, next) => {
//     const menuId = Number(req.params.id);
//     const menuExists = await dbUtils.selectOne(db, 'Menu', 'id', menuId);
//     if (menuExists.err) {
//         next(menuExists.err);
//     } else {
//         if (!menuExists.data) {
//             res.sendStatus(404);
//         } else {
//             res.status(200).json({menu:menuExists.data});
//         }
//     }
// });

// menuRouter.put('/:id', async (req, res, next) => {
//     const menuId = Number(req.params.id);
//     const menuUpdate = req.menu;
//     const {title} = menuUpdate;

//     if (!dbUtils.isValid(title)) {
//         res.sendStatus(400);
//         return;
//     }

//     const query = `UPDATE
//                         Menu
//                     SET
//                         title=$title
//                     WHERE
//                         id=$id;`;
//     const values = {
//         $id: menuId,
//         $title: title
//     };

//     console.log('NEW TITLE/MENUID>>>', req.menu, menuId);
//     const menuExists = await dbUtils.selectOne(db, 'Menu', 'id', menuId);
//     console.log('MENU EXISTS>>>', menuExists);
//     if (menuExists.err) {
//         next(menuExists.err);
//     } else {
//         if (!menuExists.data) {
//             res.sendStatus(400);
//         } else {
//             const updateResults = await dbUtils.updateOne(db, query, values);
//             if (updateResults.err) {
//                 next(updateResults.err);
//             } else {
//                 const updatedMenu = await dbUtils.selectOne(db, 'Menu', 'id', menuId);
//                 console.log('MENU UPDATED>>>', updatedMenu);
//                 if (updatedMenu.err) {
//                     next(updatedMenu.err);
//                 } else {
//                     res.status(200).json({menu:updatedMenu.data});
//                 }
//             }
//         }
//     }
// });

// menuRouter.delete('/:id', async (req, res, next) => {
//     const menuId = Number(req.params.id);

//     const hasMenuItem = await dbUtils.selectOne(db, 'MenuItem', 'menu_id', menuId);
//     if (hasMenuItem.data) {
//         res.sendStatus(400);
//         return;
//     }

//     const menuExists = await dbUtils.selectOne(db, 'Menu', 'id', menuId);
//     if (menuExists.err) {
//         next(menuExists.err);
//     } else {
//         if (!menuExists.data) {
//             res.sendStatus(400)
//         } else {
//             const deleteResults = await dbUtils.deleteOne(db, 'Menu', 'id', menuId);
//             if (deleteResults.err) {
//                 next(deleteResults.err);
//             } else {
//                 res.status(204).json({menu:menuExists.data});
//             }
//         }
//     }
// });

module.exports = menuRouter;