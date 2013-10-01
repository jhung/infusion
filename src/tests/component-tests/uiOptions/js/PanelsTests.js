/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, jQuery*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    fluid.registerNamespace("fluid.tests");

    /*******************************************************************************
     * Unit tests for fluid.uiOptions.textFont
     *******************************************************************************/
    var classnameMap = {
            "textFont": {
                "default": "",
                "times": "fl-font-uio-times",
                "comic": "fl-font-uio-comic-sans",
                "arial": "fl-font-uio-arial",
                "verdana": "fl-font-uio-verdana"
            },
            "theme": {
                "default": "fl-uio-default-theme",
                "bw": "fl-theme-uio-bw fl-theme-bw",
                "wb": "fl-theme-uio-wb fl-theme-wb",
                "by": "fl-theme-uio-by fl-theme-by",
                "yb": "fl-theme-uio-yb fl-theme-yb",
                "lgdg": "fl-theme-uio-lgdg fl-theme-lgdg"
            }
        };

    var messages = {
        "textFont.default": "default",
        "textFont.times": "Times New Roman",
        "textFont.comic": "Comic Sans",
        "textFont.arial": "Arial",
        "textFont.verdana": "Verdana",
        "textFontLabel": "Text Style",
        "contrast": ["Default", "Black on white", "White on black", "Black on yellow", "Yellow on black"],
        "contrastLabel": "Colour & Contrast"
    };

    var parentResolver = fluid.messageResolver({messageBase: messages});

    /*******************************************************************************
     * Functions shared by panel tests
     *******************************************************************************/
    fluid.tests.checkModel = function (path, expectedValue) {
        return function (newModel) {
            var newval = fluid.get(newModel, path);
            jqUnit.assertEquals("Expected model value " + expectedValue + " at path " + path, expectedValue, newval);
        };
    };

    fluid.defaults("fluid.uiOptions.defaultTestPanel", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        strings: {},
        parentBundle: {
            expander: {
                funcName: "fluid.messageResolver",
                args: [{messageBase: {}, parents: [parentResolver]}]
            }
        }
    });

    /************************
     * combined panel tests *
     ************************/

    fluid.tests.assertPathsExist = function (root, paths) {
        fluid.each(paths, function (path) {
            jqUnit.assertValue("The path '" + path + "' should exist", fluid.get(root, path));
        });
    };

    fluid.tests.listenerFuncMaker = function (funcName, args, environment) {
        return function () {
            fluid.invokeGlobalFunction(funcName, args, environment);
        };
    };

    fluid.defaults("fluid.tests.subPanel", {
        gradeNames: ["fluid.uiOptions.panel", "autoInit"],
        renderOnInit: true,
        selectors: {
            header: "h2"
        },
        protoTree: {
            header: "${value}"
        }
    });

    fluid.defaults("fluid.tests.compositePanel", {
        gradeNames: ["fluid.uiOptions.compositePanel", "autoInit"],
        selectors: {
            subPanel1: ".subPanel1",
            subPanel2: ".subPanel2"
        },
        members: {
            fireRecord: {}
        },
        invokers: {
            writeRecord: {
                funcName: "fluid.tests.compositePanel.writeRecord",
                args: ["{that}.fireRecord", "{arguments}.0"]
            }
        },
        listeners: {
            afterRender: {
                listener: "{that}.writeRecord",
                args: ["compositePanel"]
            }
        },
        resources: {
            template: {
                resourceText: '<section><article class="subPanel1"></article><article class="subPanel2"></article></section>'
            },
            subPanel1: {
                resourceText: "<h2>subPanel1</h2>"
            },
            subPanel2: {
                resourceText: "<h2>subPanel2</h2>"
            },
        },
        components: {
            subPanel1: {
                type: "fluid.tests.subPanel",
                container: "{compositePanel}.container",
                options: {
                    preferenceMap: {
                        "fluid.uiOptions.sub1": {
                            "model.value": "default",
                            "range.min": "minimum",
                            "range.max": "maximum"
                        }
                    },
                    model: {
                        value: "subPanel1"
                    },
                    listeners: {
                        afterRender: {
                            listener: "{compositePanel}.writeRecord",
                            args: ["subPanel1"]
                        }
                    }
                }
            },
            subPanel2: {
                type: "fluid.tests.subPanel",
                container: "{compositePanel}.container",
                options: {
                    preferenceMap: {
                        "fluid.uiOptions.sub2": {
                            "model.value": "default",
                            "range.min": "minimum",
                            "range.max": "maximum"
                        }
                    },
                    model: {
                        value: "subPanel2"
                    },
                    listeners: {
                        afterRender: {
                            listener: "{compositePanel}.writeRecord",
                            args: ["subPanel2"]
                        }
                    }
                }
            }
        }
    });

    fluid.tests.compositePanel.writeRecord = function (fireRecord, id) {
        var currentVal = fluid.get(fireRecord, id);
        fluid.set(fireRecord, id, currentVal !== undefined ? ++currentVal : 1);
    };

    jqUnit.test("fluid.uiOptions.compositePanel", function () {
        jqUnit.expect(10);
        var that = fluid.tests.compositePanel(".flc-uiOptions-compositePanel");

        var expectedPreferenceMap = {
            "fluid.uiOptions.sub1": {
                "model.fluid_uiOptions_sub1": "default",
                "components.subPanel1.range.min": "minimum",
                "components.subPanel1.range.max": "maximum"
            },
            "fluid.uiOptions.sub2": {
                "model.fluid_uiOptions_sub2": "default",
                "components.subPanel2.range.min": "minimum",
                "components.subPanel2.range.max": "maximum"
            }
        };

        var expectedSubPanel1Rules = {
            "fluid_uiOptions_sub1": "value"
        };

        var expectedSubPanel2Rules = {
            "fluid_uiOptions_sub2": "value"
        };

        var expectedResourceText = '<section><article class="subPanel1"><h2>subPanel1</h2></article><article class="subPanel2"><h2>subPanel2</h2></article></section>';

        var expectedFireRecord = {
            compositePanel: 3,
            subPanel1: 3,
            subPanel2: 3
        };

        var expectedSupanel1Selector = ".subPanel1 h2";
        var expectedSupanel2Selector = ".subPanel2 h2";

        var expectedTree = {
            children: [{
                ID: "subPanel1_header",
                componentType: "UIBound",
                value: "subPanel1",
                valuebinding: "fluid_uiOptions_sub1"
            }, {
                ID: "subPanel2_header",
                componentType: "UIBound",
                value: "subPanel2",
                valuebinding: "fluid_uiOptions_sub2"
            }]
        };

        jqUnit.assertDeepEq("The preferenceMap should have been assembled correctly", expectedPreferenceMap, that.options.preferenceMap);
        jqUnit.assertFalse("The renderOnInit option for subPanel1 should be false", that.subPanel1.options.renderOnInit);
        jqUnit.assertFalse("The renderOnInit option for subPanel2 should be false", that.subPanel2.options.renderOnInit);
        jqUnit.assertDeepEq("The rules block for subPanel1 should be generated correctly", expectedSubPanel1Rules, that.subPanel1.options.rules);
        jqUnit.assertDeepEq("The rules block for subPanel2 should be generated correctly", expectedSubPanel2Rules, that.subPanel2.options.rules);
        jqUnit.assertEquals("The resourceText should have been combined correctly", expectedResourceText, that.options.resources.template.resourceText);
        jqUnit.assertEquals("subPanel1's selectors should be surfaced to the compositePanel correctly", expectedSupanel1Selector, that.options.selectors.subPanel1_header);
        jqUnit.assertEquals("subPanel2's selectors should be surfaced to the compositePanel correctly", expectedSupanel2Selector, that.options.selectors.subPanel2_header);
        jqUnit.assertDeepEq("The produceTree should have combined the subPanel protoTrees together correctly", expectedTree, that.produceTree());

        // that.refreshView();
        // that.subPanel1.refreshView();
        // that.subPanel2.refreshView();
        // jqUnit.assertDeepEq("The events should have populated the fireRecored correctly", expectedFireRecord, that.fireRecord);

    });


    /*******************************************************************************
     * textFontPanel
     *******************************************************************************/
    fluid.defaults("fluid.tests.textFontPanel", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            textFont: {
                type: "fluid.uiOptions.panel.textFont",
                container: ".flc-textFont",
                options: {
                    gradeNames: "fluid.uiOptions.defaultTestPanel",
                    model: {
                        value: 1
                    },
                    classnameMap: classnameMap
                }
            },
            textFontTester: {
                type: "fluid.tests.textFontTester"
            }
        }
    });

    fluid.tests.textFontPanel.testDefault = function (that, expectedNumOfOptions, expectedFont) {
        return function () {
            var options = that.container.find("option");
            jqUnit.assertEquals("There are " + expectedNumOfOptions + " text fonts in the control", expectedNumOfOptions, options.length);
            jqUnit.assertEquals("The first text font is " + expectedFont, expectedFont, options.filter(":selected").val());

            fluid.each(options, function (option, index) {
                var css = that.options.classnameMap.textFont[option.value];
                if (css) {
                    jqUnit.assertTrue("The option has appropriate css applied", $(option).hasClass(css));
                }
            });
        };
    };

    fluid.tests.textFontPanel.changeSelection = function (element, newValue) {
        element.val(newValue).change();
    };

    fluid.defaults("fluid.tests.textFontTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            expectedNumOfOptions: 5,
            defaultValue: "default",
            newValue: "comic"
        },
        modules: [{
            name: "Test the text font settings panel",
            tests: [{
                expect: 7,
                name: "Test the rendering of the text font panel",
                sequence: [{
                    func: "{textFont}.refreshView"
                }, {
                    listenerMaker: "fluid.tests.textFontPanel.testDefault",
                    makerArgs: ["{textFont}", "{that}.options.testOptions.expectedNumOfOptions", "{that}.options.testOptions.defaultValue"],
                    event: "{textFont}.events.afterRender"
                }, {
                    func: "fluid.tests.textFontPanel.changeSelection",
                    args: ["{textFont}.dom.textFont", "{that}.options.testOptions.newValue"]
                }, {
                    listenerMaker: "fluid.tests.checkModel",
                    makerArgs: ["value", "{that}.options.testOptions.newValue"],
                    spec: {path: "value", priority: "last"},
                    changeEvent: "{textFont}.applier.modelChanged"
                }]
            }]
        }]
    });

    /*******************************************************************************
     * Contrast
     *******************************************************************************/
    fluid.defaults("fluid.tests.contrastPanel", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            contrast: {
                type: "fluid.uiOptions.panel.contrast",
                container: ".flc-contrast",
                options: {
                    gradeNames: "fluid.uiOptions.defaultTestPanel",
                    model: {
                        value: "default"
                    },
                    classnameMap: classnameMap
                }
            },
            contrastTester: {
                type: "fluid.tests.contrastTester"
            }
        }
    });

    fluid.tests.contrastPanel.testDefault = function (that, expectedNumOfOptions, expectedContrast) {
        return function () {
            var inputs = that.locate("themeInput");
            var labels = that.locate("themeLabel");

            jqUnit.assertEquals("There are " + expectedNumOfOptions + " contrast selections in the control", expectedNumOfOptions, inputs.length);
            jqUnit.assertEquals("The first contrast is " + expectedContrast, expectedContrast, inputs.filter(":checked").val());

            var inputValue, label;
            fluid.each(inputs, function (input, index) {
                inputValue = input.value;
                label = labels.eq(index);
                jqUnit.assertTrue("The contrast label has appropriate css applied", label.hasClass(that.options.classnameMap.theme[inputValue]));
            });
        };
    };

    fluid.tests.contrastPanel.changeChecked = function (inputs, newValue) {
        inputs.removeAttr("checked");
        inputs.filter("[value='" + newValue + "']").attr("checked", "checked").change();
    };

    fluid.defaults("fluid.tests.contrastTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            expectedNumOfOptions: 6,
            defaultValue: "default",
            newValue: "bw"
        },
        modules: [{
            name: "Test the contrast settings panel",
            tests: [{
                expect: 9,
                name: "Test the rendering of the contrast panel",
                sequence: [{
                    func: "{contrast}.refreshView"
                }, {
                    listenerMaker: "fluid.tests.contrastPanel.testDefault",
                    makerArgs: ["{contrast}", "{that}.options.testOptions.expectedNumOfOptions", "{that}.options.testOptions.defaultValue"],
                    spec: {priority: "last"},
                    event: "{contrast}.events.afterRender"
                }, {
                    func: "fluid.tests.contrastPanel.changeChecked",
                    args: ["{contrast}.dom.themeInput", "{that}.options.testOptions.newValue"]
                }, {
                    listenerMaker: "fluid.tests.checkModel",
                    makerArgs: ["value", "{that}.options.testOptions.newValue"],
                    spec: {path: "value", priority: "last"},
                    changeEvent: "{contrast}.applier.modelChanged"
                }]
            }]
        }]
    });

    /*******************************************************************************
     * Test functions shared by text field slider unit tests
     *******************************************************************************/
    fluid.tests.testDefault = function (that, expectedNumOfOptions, expectedContrast) {
        return function () {
            var inputValue = that.container.find("input").val();
            jqUnit.assertEquals("The default input value has been set to the min value", that.options.range.min, inputValue);
        };
    };

    fluid.tests.changeInput = function (textSlider, newValue) {
        textSlider.find("input").val(newValue).change();
    };

    /*******************************************************************************
     * textSize
     *******************************************************************************/
    fluid.defaults("fluid.tests.textSizePanel", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            textSize: {
                type: "fluid.uiOptions.panel.textSize",
                container: ".flc-textSize",
                options: {
                    gradeNames: "fluid.uiOptions.defaultTestPanel",
                    model: {
                        value: 1
                    }
                }
            },
            textSizeTester: {
                type: "fluid.tests.textSizeTester"
            }
        }
    });

    fluid.defaults("fluid.tests.textSizeTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            newValue: 1.2
        },
        modules: [{
            name: "Test the text sizer settings panel",
            tests: [{
                expect: 2,
                name: "Test the rendering of the text size panel",
                sequence: [{
                    func: "{textSize}.refreshView"
                }, {
                    listenerMaker: "fluid.tests.testDefault",
                    makerArgs: ["{textSize}", "{that}.options.testOptions.expectedNumOfOptions", "{that}.options.testOptions.defaultValue"],
                    event: "{textSize}.events.afterRender"
                }, {
                    func: "fluid.tests.changeInput",
                    args: ["{textSize}.dom.textSize", "{that}.options.testOptions.newValue"]
                }, {
                    listenerMaker: "fluid.tests.checkModel",
                    makerArgs: ["value", "{that}.options.testOptions.newValue"],
                    spec: {path: "value", priority: "last"},
                    changeEvent: "{textSize}.applier.modelChanged"
                }]
            }]
        }]
    });

    /*******************************************************************************
     * lineSpace
     *******************************************************************************/
    fluid.defaults("fluid.tests.lineSpacePanel", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            lineSpace: {
                type: "fluid.uiOptions.panel.lineSpace",
                container: ".flc-lineSpace",
                options: {
                    gradeNames: "fluid.uiOptions.defaultTestPanel",
                    model: {
                        value: 1
                    }
                }
            },
            lineSpaceTester: {
                type: "fluid.tests.lineSpaceTester"
            }
        }
    });

    fluid.defaults("fluid.tests.lineSpaceTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            newValue: 1.2
        },
        modules: [{
            name: "Test the line space settings panel",
            tests: [{
                expect: 2,
                name: "Test the rendering of the line space panel",
                sequence: [{
                    func: "{lineSpace}.refreshView"
                }, {
                    listenerMaker: "fluid.tests.testDefault",
                    makerArgs: ["{lineSpace}", "{that}.options.testOptions.expectedNumOfOptions", "{that}.options.testOptions.defaultValue"],
                    event: "{lineSpace}.events.afterRender"
                }, {
                    func: "fluid.tests.changeInput",
                    args: ["{lineSpace}.dom.textSize", "{that}.options.testOptions.newValue"]
                }, {
                    listenerMaker: "fluid.tests.checkModel",
                    makerArgs: ["value", "{that}.options.testOptions.newValue"],
                    spec: {path: "value", priority: "last"},
                    changeEvent: "{lineSpace}.applier.modelChanged"
                }]
            }]
        }]
    });

    /*******************************************************************************
     * Test functions shared by checkbox panels: layoutPanel & linkPanel
     *******************************************************************************/
    fluid.tests.changeCheckboxSelection = function (element) {
        element.attr("checked", "checked").change();
    };

    /*******************************************************************************
     * layoutPanel
     *******************************************************************************/
    fluid.defaults("fluid.tests.layoutPanel", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            layout: {
                type: "fluid.uiOptions.panel.layoutControls",
                container: ".flc-layout",
                options: {
                    gradeNames: "fluid.uiOptions.defaultTestPanel",
                    model: {
                        toc: false,
                        layout: false
                    }
                }
            },
            layoutTester: {
                type: "fluid.tests.layoutTester"
            }
        }
    });

    fluid.tests.layoutPanel.testDefault = function (checkbox, expectedValue) {
        return function () {
            var inputValue = checkbox.attr("checked");
            jqUnit.assertEquals("The toc option is not checked by default", expectedValue, inputValue);
        };
    };

    fluid.defaults("fluid.tests.layoutTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            defaultInputStatus: undefined,
            newValue: true
        },
        modules: [{
            name: "Test the layout settings panel",
            tests: [{
                expect: 2,
                name: "Test the rendering of the layout panel",
                sequence: [{
                    func: "{layout}.refreshView"
                }, {
                    listenerMaker: "fluid.tests.layoutPanel.testDefault",
                    makerArgs: ["{layout}.dom.toc", "{that}.options.testOptions.defaultInputStatus"],
                    event: "{layout}.events.afterRender"
                }, {
                    func: "fluid.tests.changeCheckboxSelection",
                    args: ["{layout}.dom.toc"]
                }, {
                    listenerMaker: "fluid.tests.checkModel",
                    makerArgs: ["toc", "{that}.options.testOptions.newValue"],
                    spec: {path: "toc", priority: "last"},
                    changeEvent: "{layout}.applier.modelChanged"
                }]
            }]
        }]
    });

    /*******************************************************************************
     * linksPanel
     *******************************************************************************/
    fluid.defaults("fluid.tests.linksPanel", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            links: {
                type: "fluid.uiOptions.panel.linksControls",
                container: ".flc-links",
                options: {
                    gradeNames: "fluid.uiOptions.defaultTestPanel",
                    model: {
                        links: false,
                        inputsLarger: false
                    }
                }
            },
            linksTester: {
                type: "fluid.tests.linksTester"
            }
        }
    });

    fluid.tests.linksPanel.testDefault = function (linksPanel, expectedValue) {
        return function () {
            var linksValue = linksPanel.locate("links").attr("checked");
            jqUnit.assertEquals("The links option is not checked by default", expectedValue, linksValue);
            var inputsLargerValue = linksPanel.locate("inputsLarger").attr("checked");
            jqUnit.assertEquals("The links option is not checked by default", expectedValue, inputsLargerValue);
        };
    };


    fluid.defaults("fluid.tests.linksTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            defaultInputStatus: undefined,
            newValue: true
        },
        modules: [{
            name: "Test the links settings panel",
            tests: [{
                expect: 4,
                name: "Test the rendering of the links panel",
                sequence: [{
                    func: "{links}.refreshView"
                }, {
                    listenerMaker: "fluid.tests.linksPanel.testDefault",
                    makerArgs: ["{links}", "{that}.options.testOptions.defaultInputStatus"],
                    event: "{links}.events.afterRender"
                }, {
                    func: "fluid.tests.changeCheckboxSelection",
                    args: ["{links}.dom.links"]
                }, {
                    listenerMaker: "fluid.tests.checkModel",
                    makerArgs: ["links", "{that}.options.testOptions.newValue"],
                    spec: {path: "links", priority: "last"},
                    changeEvent: "{links}.applier.modelChanged"
                }, {
                    func: "fluid.tests.changeCheckboxSelection",
                    args: ["{links}.dom.inputsLarger"]
                }, {
                    listenerMaker: "fluid.tests.checkModel",
                    makerArgs: ["inputsLarger", "{that}.options.testOptions.newValue"],
                    spec: {path: "inputsLarger", priority: "last"},
                    changeEvent: "{links}.applier.modelChanged"
                }]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.textFontPanel",
            "fluid.tests.contrastPanel",
            "fluid.tests.textSizePanel",
            "fluid.tests.lineSpacePanel",
            "fluid.tests.layoutPanel",
            "fluid.tests.linksPanel"
        ]);
    });

})(jQuery);
