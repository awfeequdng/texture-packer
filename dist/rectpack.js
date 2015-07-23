(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.RP = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var BinPackingAlgorithm = function BinPackingAlgorithm(blocks, w, h) {
    this.root = { x: 0, y: 0, w: w, h: h };

    this.fit = function (blocks) {
        var n, node, block;
        for (n = 0; n < blocks.length; n++) {
            block = blocks[n];
            if (node = this.findNode(this.root, block.width, block.height)) {
                block.fit = this.splitNode(node, block.width, block.height);
                block.x = block.fit.x;
                block.y = block.fit.y;
            } else {
                this.root = this.growForNode(this.root, block.width, block.height);
                if (node = this.findNode(this.root, block.width, block.height)) {
                    block.fit = this.splitNode(node, block.width, block.height);
                    block.x = block.fit.x;
                    block.y = block.fit.y;
                }
            }
        }
        return blocks;
    };

    this.findNode = function (root, w, h) {
        if (root.used) return this.findNode(root.right, w, h) || this.findNode(root.down, w, h);else if (w <= root.w && h <= root.h) return root;else return null;
    };

    this.splitNode = function (node, w, h) {
        node.used = true;
        node.down = { x: node.x, y: node.y + h, w: node.w, h: node.h - h };
        node.right = { x: node.x + w, y: node.y, w: node.w - w, h: h };
        return node;
    };

    this.growForNode = function (root, w, h) {

        var canGrowRight = h <= root.h;
        var canGrowDown = w <= root.w;

        var shouldGrowRight = canGrowRight && root.w + w <= root.h;
        var shouldGrowDown = canGrowDown && root.h + h <= root.w;
        var node = root;
        if (shouldGrowRight) {
            return this.growRight(node, w, h);
        } else if (shouldGrowDown) {
            return this.growDown(node, w, h);
        } else if (canGrowRight) {
            return this.growRight(node, w, h);
        } else if (canGrowDown) {
            return this.growDown(node, w, h);
        } else {
            return null;
        }
    };

    this.growRight = function (node, w, h) {
        var newNode = {
            "used": true,
            "x": 0,
            "y": 0,
            "w": node.w + w,
            "h": node.h,
            "down": node,
            "right": {
                "x": node.w + node.x,
                "y": node.y,
                "w": w,
                "h": node.h
            }
        };
        return newNode;
    };

    this.growDown = function (node, w, h) {
        var newNode = {
            "used": true,
            "x": 0,
            "y": 0,
            "w": node.w,
            "h": node.h + h,
            "down": {
                "x": node.x,
                "y": node.y + node.h,
                "w": node.w,
                "h": h
            },
            "right": node
        };
        return newNode;
    };

    var theBlocks = this.fit(blocks);
    return {
        "elements": theBlocks,
        "size": {
            width: this.root.w,
            height: this.root.h
        }
    };
};

module.exports = BinPackingAlgorithm;

},{}],2:[function(require,module,exports){
"use strict";

var Algo = require("./BinPackingAlgorithm");

var RP = function RP(elements, confobj) {
    var RP = function RP(els, conf) {
        var elements = els.length > 0 && els instanceof Array ? els : console.error("No Elements my friend");
        var conf = conf || {};
        var config = {
            "padding": conf.padding || 2
        };

        //"atlasPadding": conf.atlaspadding || 1
        //"cutfiles": conf.cutfiles || false,
        //"forceRect":conf.forceRect || false
        var cleanElements = function cleanElements(els) {
            var clean = function clean(s) {
                if (typeof s == 'string' || s instanceof String) {
                    var c = parseFloat(s.replace("px", ""));
                    return c;
                }
                return s;
            };
            els.forEach(function (el) {
                el.height = clean(el.height);
                el.width = clean(el.width);
            });
            return els;
        };

        var sortedByHeightElements = function sortedByHeightElements(elements) {
            return elements.slice(0).sort(function (a, b) {
                if (a.height > b.height) return -1;
                return 1;
            });
        };

        var init = function init(elements, config) {
            var sortedElements = sortedByHeightElements(cleanElements(elements));
            if (config.padding) {
                sortedElements.forEach(function (el) {
                    el.width += 2 * config.padding;
                    el.height += 2 * config.padding;
                });
            }
            var area = 0;
            sortedElements.forEach(function (el, idx) {
                var elarea = el.width * el.height;
                area += elarea;
            });
            area *= 1.1;
            var sidelength = Math.sqrt(area);

            var theData = new Algo(sortedElements, sidelength, sidelength);

            var els = theData.elements;
            els.forEach(function (el) {

                delete el.fit;
                if (config.padding) {
                    el.x += config.padding;
                    el.y += config.padding;
                    el.width -= config.padding;
                    el.height -= config.padding;
                }
            });
            return {
                elements: els,
                atlasSize: {
                    width: theData.size.width,
                    height: theData.size.height
                }
            };
        };

        return init(elements, confobj);
    };
    return new RP(elements, confobj);
};

module.exports = RP;

},{"./BinPackingAlgorithm":1}]},{},[2])(2)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZmxleC9EZXNrdG9wL1Byb2plY3RzL1JlY3RhbmdsZVBhY2tpbmcvc3JjL0JpblBhY2tpbmdBbGdvcml0aG0uanMiLCIvVXNlcnMvZmxleC9EZXNrdG9wL1Byb2plY3RzL1JlY3RhbmdsZVBhY2tpbmcvc3JjL1JlY3RhbmdsZVBhY2tlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxtQkFBbUIsR0FBRyxTQUF0QixtQkFBbUIsQ0FBWSxNQUFNLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUMxQyxRQUFJLENBQUMsSUFBSSxHQUFHLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFBOztBQUU3QixRQUFJLENBQUMsR0FBRyxHQUFHLFVBQVMsTUFBTSxFQUFDO0FBQ3ZCLFlBQUksQ0FBQyxFQUFDLElBQUksRUFBQyxLQUFLLENBQUM7QUFDakIsYUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFDLENBQUMsRUFBRSxFQUFDO0FBQzdCLGlCQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLGdCQUFHLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUMsS0FBSyxDQUFDLEtBQUssRUFBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUM7QUFDeEQscUJBQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDM0QscUJBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdEIscUJBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDekIsTUFBSTtBQUNELG9CQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBQyxLQUFLLENBQUMsS0FBSyxFQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNqRSxvQkFBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFDO0FBQ3hELHlCQUFLLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzNELHlCQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3RCLHlCQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2lCQUN6QjthQUNKO1NBQ0o7QUFDRCxlQUFPLE1BQU0sQ0FBQztLQUNqQixDQUFBOztBQUVELFFBQUksQ0FBQyxRQUFRLEdBQUcsVUFBUyxJQUFJLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUM5QixZQUFJLElBQUksQ0FBQyxJQUFJLEVBQ1QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FDeEUsSUFBSSxBQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxBQUFDLEVBQ25DLE9BQU8sSUFBSSxDQUFDLEtBRVosT0FBTyxJQUFJLENBQUM7S0FDbkIsQ0FBQTs7QUFFRCxRQUFJLENBQUMsU0FBUyxHQUFHLFVBQVMsSUFBSSxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFDL0IsWUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsWUFBSSxDQUFDLElBQUksR0FBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUM1RSxZQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFXLENBQUM7QUFDNUUsZUFBTyxJQUFJLENBQUM7S0FDZixDQUFBOztBQUVELFFBQUksQ0FBQyxXQUFXLEdBQUcsVUFBUyxJQUFJLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQzs7QUFFakMsWUFBSSxZQUFZLEdBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEFBQUMsQ0FBQztBQUNqQyxZQUFJLFdBQVcsR0FBSSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQUFBQyxDQUFDOztBQUVoQyxZQUFJLGVBQWUsR0FBRyxZQUFZLElBQU0sQUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBTSxJQUFJLENBQUMsQ0FBQyxBQUFDLENBQUM7QUFDbEUsWUFBSSxjQUFjLEdBQUcsV0FBVyxJQUFLLEFBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQU0sSUFBSSxDQUFDLENBQUMsQUFBQyxDQUFDO0FBQzlELFlBQUksSUFBSSxHQUFHLElBQUksQ0FBQztBQUNoQixZQUFHLGVBQWUsRUFBQztBQUNmLG1CQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztTQUNuQyxNQUFLLElBQUcsY0FBYyxFQUFDO0FBQ3BCLG1CQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztTQUNsQyxNQUFLLElBQUcsWUFBWSxFQUFDO0FBQ2xCLG1CQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztTQUNuQyxNQUFLLElBQUcsV0FBVyxFQUFDO0FBQ2pCLG1CQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztTQUNsQyxNQUFJO0FBQ0QsbUJBQU8sSUFBSSxDQUFDO1NBQ2Y7S0FDSixDQUFBOztBQUVELFFBQUksQ0FBQyxTQUFTLEdBQUcsVUFBUyxJQUFJLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUMvQixZQUFJLE9BQU8sR0FBRztBQUNWLGtCQUFNLEVBQUMsSUFBSTtBQUNYLGVBQUcsRUFBQyxDQUFDO0FBQ0wsZUFBRyxFQUFDLENBQUM7QUFDTCxlQUFHLEVBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEFBQUM7QUFDakIsZUFBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ1gsa0JBQU0sRUFBRyxJQUFJO0FBQ2IsbUJBQU8sRUFBRztBQUNOLG1CQUFHLEVBQUMsSUFBSSxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqQixtQkFBRyxFQUFDLElBQUksQ0FBQyxDQUFDO0FBQ1YsbUJBQUcsRUFBQyxDQUFDO0FBQ0wsbUJBQUcsRUFBQyxJQUFJLENBQUMsQ0FBQzthQUNiO1NBQ0osQ0FBQztBQUNGLGVBQU8sT0FBTyxDQUFBO0tBQ2pCLENBQUE7O0FBRUQsUUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFTLElBQUksRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQzlCLFlBQUksT0FBTyxHQUFHO0FBQ1Ysa0JBQU0sRUFBQyxJQUFJO0FBQ1gsZUFBRyxFQUFDLENBQUM7QUFDTCxlQUFHLEVBQUMsQ0FBQztBQUNMLGVBQUcsRUFBRyxJQUFJLENBQUMsQ0FBQyxBQUFDO0FBQ2IsZUFBRyxFQUFHLElBQUksQ0FBQyxDQUFDLEdBQUMsQ0FBQyxBQUFDO0FBQ2Ysa0JBQU0sRUFBRztBQUNMLG1CQUFHLEVBQUMsSUFBSSxDQUFDLENBQUM7QUFDVixtQkFBRyxFQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDbkIsbUJBQUcsRUFBQyxJQUFJLENBQUMsQ0FBQztBQUNWLG1CQUFHLEVBQUUsQ0FBQzthQUNUO0FBQ0QsbUJBQU8sRUFBRyxJQUFJO1NBQ2pCLENBQUM7QUFDRixlQUFPLE9BQU8sQ0FBQztLQUNsQixDQUFBOztBQUVELFFBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDakMsV0FBTztBQUNILGtCQUFVLEVBQUMsU0FBUztBQUNwQixjQUFNLEVBQUM7QUFDSCxpQkFBSyxFQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqQixrQkFBTSxFQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNyQjtLQUNKLENBQUE7Q0FDSixDQUFBOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsbUJBQW1CLENBQUM7Ozs7O0FDMUdyQyxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQzs7QUFHNUMsSUFBSSxFQUFFLEdBQUcsWUFBUyxRQUFRLEVBQUMsT0FBTyxFQUFDO0FBQy9CLFFBQUksRUFBRSxHQUFHLFNBQUwsRUFBRSxDQUFZLEdBQUcsRUFBQyxJQUFJLEVBQUM7QUFDdkIsWUFBSSxRQUFRLEdBQUcsQUFBRSxBQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFPLEdBQUcsWUFBWSxLQUFLLEFBQUMsR0FBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQy9HLFlBQUksSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7QUFDdEIsWUFBSSxNQUFNLEdBQUc7QUFDVCxxQkFBUyxFQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQztTQUk5QixDQUFBOzs7OztBQUVELFlBQUksYUFBYSxHQUFHLFNBQWhCLGFBQWEsQ0FBWSxHQUFHLEVBQUM7QUFDN0IsZ0JBQUksS0FBSyxHQUFHLFNBQVIsS0FBSyxDQUFZLENBQUMsRUFBQztBQUNuQixvQkFBRyxBQUFDLE9BQU8sQ0FBQyxJQUFJLFFBQVEsSUFBTSxDQUFDLFlBQVksTUFBTSxBQUFDLEVBQUM7QUFDL0Msd0JBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLDJCQUFPLENBQUMsQ0FBQztpQkFDWjtBQUNELHVCQUFPLENBQUMsQ0FBQzthQUNaLENBQUM7QUFDRixlQUFHLENBQUMsT0FBTyxDQUFDLFVBQVMsRUFBRSxFQUFDO0FBQ3BCLGtCQUFFLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0Isa0JBQUUsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM5QixDQUFDLENBQUM7QUFDSCxtQkFBTyxHQUFHLENBQUM7U0FDZCxDQUFBOztBQUVELFlBQUksc0JBQXNCLEdBQUcsU0FBekIsc0JBQXNCLENBQVksUUFBUSxFQUFDO0FBQzNDLG1CQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUN2QyxvQkFBRyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUNqQyx1QkFBTyxDQUFDLENBQUM7YUFDWixDQUFDLENBQUM7U0FFTixDQUFBOztBQUVELFlBQUksSUFBSSxHQUFHLFNBQVAsSUFBSSxDQUFZLFFBQVEsRUFBQyxNQUFNLEVBQUM7QUFDaEMsZ0JBQUksY0FBYyxHQUFHLHNCQUFzQixDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLGdCQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUM7QUFDZCw4QkFBYyxDQUFDLE9BQU8sQ0FBQyxVQUFTLEVBQUUsRUFBQztBQUMvQixzQkFBRSxDQUFDLEtBQUssSUFBSSxDQUFDLEdBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztBQUM3QixzQkFBRSxDQUFDLE1BQU0sSUFBSSxDQUFDLEdBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztpQkFDakMsQ0FBQyxDQUFDO2FBQ047QUFDRCxnQkFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQ2IsMEJBQWMsQ0FBQyxPQUFPLENBQUMsVUFBUyxFQUFFLEVBQUMsR0FBRyxFQUFDO0FBQ25DLG9CQUFJLE1BQU0sR0FBRyxFQUFFLENBQUMsS0FBSyxHQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUM7QUFDaEMsb0JBQUksSUFBSSxNQUFNLENBQUM7YUFDbEIsQ0FBQyxDQUFDO0FBQ0gsZ0JBQUksSUFBSSxHQUFHLENBQUM7QUFDWixnQkFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFakMsZ0JBQUksT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBQyxVQUFVLEVBQUMsVUFBVSxDQUFDLENBQUM7O0FBRTdELGdCQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO0FBQzNCLGVBQUcsQ0FBQyxPQUFPLENBQUMsVUFBUyxFQUFFLEVBQUM7O0FBRXBCLHVCQUFPLEVBQUUsQ0FBQyxHQUFHLEFBQUMsQ0FBQztBQUNmLG9CQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUM7QUFDZCxzQkFBRSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDO0FBQ3ZCLHNCQUFFLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFDdkIsc0JBQUUsQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQztBQUMzQixzQkFBRSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDO2lCQUMvQjthQUVKLENBQUMsQ0FBQztBQUNILG1CQUFPO0FBQ0gsd0JBQVEsRUFBQyxHQUFHO0FBQ1oseUJBQVMsRUFBQztBQUNOLHlCQUFLLEVBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLO0FBQ3hCLDBCQUFNLEVBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNO2lCQUM3QjthQUNKLENBQUM7U0FDTCxDQUFBOztBQUVELGVBQU8sSUFBSSxDQUFDLFFBQVEsRUFBQyxPQUFPLENBQUMsQ0FBQztLQUNqQyxDQUFBO0FBQ0QsV0FBTyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUMsT0FBTyxDQUFDLENBQUM7Q0FDbkMsQ0FBQTs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgQmluUGFja2luZ0FsZ29yaXRobSA9IGZ1bmN0aW9uKGJsb2Nrcyx3LGgpe1xuICAgIHRoaXMucm9vdCA9IHt4OjAseTowLHc6dyxoOmh9XG5cbiAgICB0aGlzLmZpdCA9IGZ1bmN0aW9uKGJsb2Nrcyl7XG4gICAgICAgIHZhciBuLG5vZGUsYmxvY2s7XG4gICAgICAgIGZvcihuID0gMDsgbiA8IGJsb2Nrcy5sZW5ndGg7bisrKXtcbiAgICAgICAgICAgIGJsb2NrID0gYmxvY2tzW25dO1xuICAgICAgICAgICAgaWYobm9kZSA9IHRoaXMuZmluZE5vZGUodGhpcy5yb290LGJsb2NrLndpZHRoLGJsb2NrLmhlaWdodCkpe1xuICAgICAgICAgICAgICAgIGJsb2NrLmZpdCA9IHRoaXMuc3BsaXROb2RlKG5vZGUsIGJsb2NrLndpZHRoLGJsb2NrLmhlaWdodCk7XG4gICAgICAgICAgICAgICAgYmxvY2sueCA9IGJsb2NrLmZpdC54O1xuICAgICAgICAgICAgICAgIGJsb2NrLnkgPSBibG9jay5maXQueTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIHRoaXMucm9vdCA9IHRoaXMuZ3Jvd0Zvck5vZGUodGhpcy5yb290LGJsb2NrLndpZHRoLGJsb2NrLmhlaWdodCk7XG4gICAgICAgICAgICAgICAgaWYobm9kZSA9IHRoaXMuZmluZE5vZGUodGhpcy5yb290LGJsb2NrLndpZHRoLGJsb2NrLmhlaWdodCkpe1xuICAgICAgICAgICAgICAgICAgICBibG9jay5maXQgPSB0aGlzLnNwbGl0Tm9kZShub2RlLCBibG9jay53aWR0aCxibG9jay5oZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICBibG9jay54ID0gYmxvY2suZml0Lng7XG4gICAgICAgICAgICAgICAgICAgIGJsb2NrLnkgPSBibG9jay5maXQueTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJsb2NrcztcbiAgICB9XG5cbiAgICB0aGlzLmZpbmROb2RlID0gZnVuY3Rpb24ocm9vdCx3LGgpe1xuICAgICAgICBpZiAocm9vdC51c2VkKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmluZE5vZGUocm9vdC5yaWdodCwgdywgaCkgfHwgdGhpcy5maW5kTm9kZShyb290LmRvd24sIHcsIGgpO1xuICAgICAgICBlbHNlIGlmICgodyA8PSByb290LncpICYmIChoIDw9IHJvb3QuaCkpXG4gICAgICAgICAgICByZXR1cm4gcm9vdDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5zcGxpdE5vZGUgPSBmdW5jdGlvbihub2RlLHcsaCl7XG4gICAgICAgIG5vZGUudXNlZCA9IHRydWU7XG4gICAgICAgIG5vZGUuZG93biAgPSB7IHg6IG5vZGUueCwgICAgIHk6IG5vZGUueSArIGgsIHc6IG5vZGUudywgICAgIGg6IG5vZGUuaCAtIGggfTtcbiAgICAgICAgbm9kZS5yaWdodCA9IHsgeDogbm9kZS54ICsgdywgeTogbm9kZS55LCAgICAgdzogbm9kZS53IC0gdywgaDogaCAgICAgICAgICB9O1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG5cbiAgICB0aGlzLmdyb3dGb3JOb2RlID0gZnVuY3Rpb24ocm9vdCx3LGgpe1xuXG4gICAgICAgIHZhciBjYW5Hcm93UmlnaHQgPSAoaCA8PSByb290LmgpO1xuICAgICAgICB2YXIgY2FuR3Jvd0Rvd24gPSAodyA8PSByb290LncpO1xuXG4gICAgICAgIHZhciBzaG91bGRHcm93UmlnaHQgPSBjYW5Hcm93UmlnaHQgJiYgKCAoIHJvb3QudyArIHcgKSA8PSByb290LmgpO1xuICAgICAgICB2YXIgc2hvdWxkR3Jvd0Rvd24gPSBjYW5Hcm93RG93biAmJiAoKHJvb3QuaCArIGggKSA8PSByb290LncpO1xuICAgICAgICB2YXIgbm9kZSA9IHJvb3Q7XG4gICAgICAgIGlmKHNob3VsZEdyb3dSaWdodCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ncm93UmlnaHQobm9kZSx3LGgpO1xuICAgICAgICB9ZWxzZSBpZihzaG91bGRHcm93RG93bil7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ncm93RG93bihub2RlLHcsaCk7XG4gICAgICAgIH1lbHNlIGlmKGNhbkdyb3dSaWdodCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ncm93UmlnaHQobm9kZSx3LGgpO1xuICAgICAgICB9ZWxzZSBpZihjYW5Hcm93RG93bil7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ncm93RG93bihub2RlLHcsaCk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmdyb3dSaWdodCA9IGZ1bmN0aW9uKG5vZGUsdyxoKXtcbiAgICAgICAgdmFyIG5ld05vZGUgPSB7XG4gICAgICAgICAgICBcInVzZWRcIjp0cnVlLFxuICAgICAgICAgICAgXCJ4XCI6MCxcbiAgICAgICAgICAgIFwieVwiOjAsXG4gICAgICAgICAgICBcIndcIjogKG5vZGUudyArIHcpLFxuICAgICAgICAgICAgXCJoXCI6IG5vZGUuaCxcbiAgICAgICAgICAgIFwiZG93blwiIDogbm9kZSxcbiAgICAgICAgICAgIFwicmlnaHRcIiA6IHtcbiAgICAgICAgICAgICAgICBcInhcIjpub2RlLncrbm9kZS54LFxuICAgICAgICAgICAgICAgIFwieVwiOm5vZGUueSxcbiAgICAgICAgICAgICAgICBcIndcIjp3LFxuICAgICAgICAgICAgICAgIFwiaFwiOm5vZGUuaFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gbmV3Tm9kZVxuICAgIH1cblxuICAgIHRoaXMuZ3Jvd0Rvd24gPSBmdW5jdGlvbihub2RlLHcsaCl7XG4gICAgICAgIHZhciBuZXdOb2RlID0ge1xuICAgICAgICAgICAgXCJ1c2VkXCI6dHJ1ZSxcbiAgICAgICAgICAgIFwieFwiOjAsXG4gICAgICAgICAgICBcInlcIjowLFxuICAgICAgICAgICAgXCJ3XCI6IChub2RlLncpLFxuICAgICAgICAgICAgXCJoXCI6IChub2RlLmgraCksXG4gICAgICAgICAgICBcImRvd25cIiA6IHtcbiAgICAgICAgICAgICAgICBcInhcIjpub2RlLngsXG4gICAgICAgICAgICAgICAgXCJ5XCI6bm9kZS55ICsgbm9kZS5oLFxuICAgICAgICAgICAgICAgIFwid1wiOm5vZGUudyxcbiAgICAgICAgICAgICAgICBcImhcIjogaFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwicmlnaHRcIiA6IG5vZGVcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIG5ld05vZGU7XG4gICAgfVxuXG4gICAgdmFyIHRoZUJsb2NrcyA9IHRoaXMuZml0KGJsb2Nrcyk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgXCJlbGVtZW50c1wiOnRoZUJsb2NrcyxcbiAgICAgICAgXCJzaXplXCI6e1xuICAgICAgICAgICAgd2lkdGg6dGhpcy5yb290LncsXG4gICAgICAgICAgICBoZWlnaHQ6dGhpcy5yb290LmhcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCaW5QYWNraW5nQWxnb3JpdGhtOyIsInZhciBBbGdvID0gcmVxdWlyZShcIi4vQmluUGFja2luZ0FsZ29yaXRobVwiKTtcblxuXG52YXIgUlAgPSBmdW5jdGlvbihlbGVtZW50cyxjb25mb2JqKXtcbiAgICB2YXIgUlAgPSBmdW5jdGlvbihlbHMsY29uZil7XG4gICAgICAgIHZhciBlbGVtZW50cyA9ICggKGVscy5sZW5ndGggPiAwKSAmJiAgKGVscyBpbnN0YW5jZW9mIEFycmF5KSApID8gIGVscyA6IGNvbnNvbGUuZXJyb3IoXCJObyBFbGVtZW50cyBteSBmcmllbmRcIik7XG4gICAgICAgIHZhciBjb25mID0gY29uZiB8fCB7fTtcbiAgICAgICAgdmFyIGNvbmZpZyA9IHtcbiAgICAgICAgICAgIFwicGFkZGluZ1wiOmNvbmYucGFkZGluZyB8fCAyLFxuICAgICAgICAgICAgLy9cImF0bGFzUGFkZGluZ1wiOiBjb25mLmF0bGFzcGFkZGluZyB8fCAxXG4gICAgICAgICAgICAvL1wiY3V0ZmlsZXNcIjogY29uZi5jdXRmaWxlcyB8fCBmYWxzZSxcbiAgICAgICAgICAgIC8vXCJmb3JjZVJlY3RcIjpjb25mLmZvcmNlUmVjdCB8fCBmYWxzZVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNsZWFuRWxlbWVudHMgPSBmdW5jdGlvbihlbHMpe1xuICAgICAgICAgICAgdmFyIGNsZWFuID0gZnVuY3Rpb24ocyl7XG4gICAgICAgICAgICAgICAgaWYoKHR5cGVvZiBzID09ICdzdHJpbmcnKSB8fCAocyBpbnN0YW5jZW9mIFN0cmluZykpe1xuICAgICAgICAgICAgICAgICAgICB2YXIgYyA9IHBhcnNlRmxvYXQocy5yZXBsYWNlKFwicHhcIixcIlwiKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcztcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBlbHMuZm9yRWFjaChmdW5jdGlvbihlbCl7XG4gICAgICAgICAgICAgICAgZWwuaGVpZ2h0ID0gY2xlYW4oZWwuaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBlbC53aWR0aCA9IGNsZWFuKGVsLndpZHRoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGVscztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzb3J0ZWRCeUhlaWdodEVsZW1lbnRzID0gZnVuY3Rpb24oZWxlbWVudHMpe1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnRzLnNsaWNlKDApLnNvcnQoZnVuY3Rpb24oYSxiKXtcbiAgICAgICAgICAgICAgICBpZihhLmhlaWdodCA+IGIuaGVpZ2h0KXJldHVybiAtMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaW5pdCA9IGZ1bmN0aW9uKGVsZW1lbnRzLGNvbmZpZyl7XG4gICAgICAgICAgICB2YXIgc29ydGVkRWxlbWVudHMgPSBzb3J0ZWRCeUhlaWdodEVsZW1lbnRzKGNsZWFuRWxlbWVudHMoZWxlbWVudHMpKTtcbiAgICAgICAgICAgIGlmKGNvbmZpZy5wYWRkaW5nKXtcbiAgICAgICAgICAgICAgICBzb3J0ZWRFbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcbiAgICAgICAgICAgICAgICAgICAgZWwud2lkdGggKz0gMipjb25maWcucGFkZGluZztcbiAgICAgICAgICAgICAgICAgICAgZWwuaGVpZ2h0ICs9IDIqY29uZmlnLnBhZGRpbmc7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYXJlYSA9IDA7XG4gICAgICAgICAgICBzb3J0ZWRFbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsLGlkeCl7XG4gICAgICAgICAgICAgICAgdmFyIGVsYXJlYSA9IGVsLndpZHRoKmVsLmhlaWdodDtcbiAgICAgICAgICAgICAgICBhcmVhICs9IGVsYXJlYTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYXJlYSAqPSAxLjE7XG4gICAgICAgICAgICB2YXIgc2lkZWxlbmd0aCA9IE1hdGguc3FydChhcmVhKTtcblxuICAgICAgICAgICAgdmFyIHRoZURhdGEgPSBuZXcgQWxnbyhzb3J0ZWRFbGVtZW50cyxzaWRlbGVuZ3RoLHNpZGVsZW5ndGgpO1xuXG4gICAgICAgICAgICB2YXIgZWxzID0gdGhlRGF0YS5lbGVtZW50cztcbiAgICAgICAgICAgIGVscy5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcblxuICAgICAgICAgICAgICAgIGRlbGV0ZShlbC5maXQpO1xuICAgICAgICAgICAgICAgIGlmKGNvbmZpZy5wYWRkaW5nKXtcbiAgICAgICAgICAgICAgICAgICAgZWwueCArPSBjb25maWcucGFkZGluZztcbiAgICAgICAgICAgICAgICAgICAgZWwueSArPSBjb25maWcucGFkZGluZztcbiAgICAgICAgICAgICAgICAgICAgZWwud2lkdGggLT0gY29uZmlnLnBhZGRpbmc7XG4gICAgICAgICAgICAgICAgICAgIGVsLmhlaWdodCAtPSBjb25maWcucGFkZGluZztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50czplbHMsXG4gICAgICAgICAgICAgICAgYXRsYXNTaXplOntcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6dGhlRGF0YS5zaXplLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6dGhlRGF0YS5zaXplLmhlaWdodFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaW5pdChlbGVtZW50cyxjb25mb2JqKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBSUChlbGVtZW50cyxjb25mb2JqKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSUDsiXX0=