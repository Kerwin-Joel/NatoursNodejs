"use strict";

var Tour = require('../model/tourModel');

var catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(function _callee(req, res) {
  var tours;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(Tour.find());

        case 2:
          tours = _context.sent;
          // 2) Build template
          // 3) Render that template using tour data from 
          res.status(200).render('overview', {
            title: 'All tours',
            elemento: [1, 3, 4]
          });

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
});

exports.getTour = function (req, res) {
  res.status(200).render('tour', {
    title: 'The Forest Hiker Tour'
  });
};