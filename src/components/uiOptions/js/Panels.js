/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_5:true, jQuery*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};


(function ($, fluid) {

    /***********************************************
     * Base grade panel
     ***********************************************/

    fluid.defaults("fluid.uiOptions.panel", {
        gradeNames: ["fluid.rendererComponent", "fluid.uiOptions.modelRelay", "autoInit"],
        preferenceMap: {}
    });


    /***************************
     * Base grade for subpanel *
     ***************************/

    fluid.defaults("fluid.uiOptions.supPanel", {
        gradeNames: ["fluid.uiOptions.panel", "autoInit"],
        mergePolicy: {
            sourceApplier: "nomerge"
        },
        sourceApplier: "{combinedPanel}.applier",
        listeners: {
            "{combinedPanel}.events.afterRender": {
                listener: "{that}.events.afterRender",
                args: ["{that}"]
            }
        },
        rules: {
            expander: {
                func: "fluid.uiOptions.supPanel.generateRules",
                args: ["{that}.options.preferenceMap"]
            }
        },
        invokers: {
            refreshView: "{combinedPanel}.refreshView"
        },
        strings: {},
        // parentBundle: "", // add this in later
        renderOnInit: false
    });

    /*
     * Generates the model relay rules for a subpanel.
     * Takes advantage of the fact that combinedPanel
     * uses the preference key (with "." replaced by "_"),
     * as its model path.
     */
    fluid.uiOptions.supPanel.generateRules = function (preferenceMap) {
        var rules = {};
        fluid.each(preferenceMap, function (prefObj, prefKey) {
            $.each(prefObj, function (prefRule) {
                if (prefRule.indexOf("model.") === 0) {
                    rules[prefKey.replace(".", "_", "g")] = prefRule.slice(6);
                }
            });
        });
        return rules;
    };

    /*********************************
     * Base grade for combined panel *
     *********************************/

    fluid.defaults("fluid.uiOptions.combinedPanel", {
        gradeNames: ["fluid.uiOptions.panel", "autoInit", "{that}.getDistributeOptionsGrade"],
        mergePolicy: {
            subPanelOverrides: "noexpand"
        },
        preferenceMap: {
            expander: {
                funcName: "fluid.uiOptions.combinedPanel.combinePreferenceMaps",
                args: ["{that}.options.components"]
            }
        },
        selectors: {}, // requires selectors into the template which will act as the containers for the subpanels
        listeners: {
            "onCreate.combineResources": "{that}.combineResources",
            "onCreate.surfaceSubpanelRendererSelectors": "{that}.surfaceSubpanelRendererSelectors"
        },
        invokers: {
            getDistributeOptionsGrade: {
                funcName: "fluid.uiOptions.combinedPanel.assembleDistributeOptions",
                args: ["{that}.options.components"]
            },
            combineResources: {
                funcName: "fluid.uiOptions.combinedPanel.combineTemplates",
                args: ["{that}.options.resources", "{that}.options.selectors"]
            },
            surfaceSubpanelRendererSelectors: {
                funcName: "fluid.uiOptions.combinedPanel.surfaceSubpanelRendererSelectors",
                args: ["{that}.options.components", "{that}.options.selectors"]
            }
        },
        subPanelOverrides: {
            gradeNames: ["fluid.uiOptions.supPanel"]
        },
        components: {},
        resources: {} // template is reserved for the combinedPanel's template, the subpanel template should have same key as the selector for its container.
    });

    /*
     * Combines the preference maps of the subpanels into a single preference map,
     * to be used by the combined panel.
     * Note that this assumes the internal model paths to be the same as the
     * preference key (with "." replaced by "_").
     * Any other options mapping is done by forwarding the option down to the subpanel.
     */
    fluid.uiOptions.combinedPanel.combinePreferenceMaps = function (components) {
        var preferenceMap = {};
        fluid.each(components, function (component, cmpName) {
            var opts = $.extend(true, {}, fluid.defaults(component.type), component.options);
            var prefMap = opts.preferenceMap;
            if (prefMap) {
                fluid.each(prefMap, function (preference, prefName) {
                    var prefObj = {};
                    fluid.each(preference, function (rule, ruleName) {
                        var mdlPrefix = "model.";
                        if (ruleName.indexOf(mdlPrefix) === 0) {
                            prefObj[mdlPrefix + prefName.replace(".", "_", "g")] = rule;
                        } else {
                            prefObj["components." + cmpName  + "." + ruleName] = rule;
                        }
                    });
                    preferenceMap[prefName] = prefObj;
                });
            }
        });
        return preferenceMap;
    };

    /*
     * Creates a grade containing the distributeOptions rules needed for the subcomponents
     */
    fluid.uiOptions.combinedPanel.assembleDistributeOptions = function (components) {
        var gradeName = "fluid.uiOptions.combinedPanel.distributeOptions";
        var distributeRules = [];
        $.each(components, function (componentName) {
            distributeRules.push({
                source: "{that}.options.subPanelOverrides",
                target: "{that > " + componentName + "}.options"
            });
        });

        fluid.defaults(gradeName, {
            gradeNames: ["fluid.littleComponent", "autoInit"],
            distributeOptions: distributeRules
        });

        return gradeName;
    };

    /*
     * Use the renderer directly to combine the templates into a single
     * template to be used by the components actual rendering.
     */
    fluid.uiOptions.combinedPanel.combineTemplates = function (resources, selectors) {
        var cutpoints = [];
        var tree = {children: []};

        fluid.each(resources, function (resource, resourceName) {
            if (resourceName !== "template") {
                tree.children.push({
                    ID: resourceName,
                    markup: resource.resourceText
                });
                cutpoints.push({
                    id: resourceName,
                    selector: selectors[resourceName]
                });
            }
        });

        var resourceSpec = {
            base: {
                resourceText: resources.template.resourceText,
                href: ".",
                resourceKey: ".",
                cutpoints: cutpoints
            }
        };

        var templates = fluid.parseTemplates(resourceSpec, ["base"]);
        var renderer = fluid.renderer(templates, tree, {cutpoints: cutpoints, debugMode: true});
        resources.template.resourceText = renderer.renderTemplates();
    };

    /*
     * Surfaces the rendering selectors from the subpanels to the combinedPanel,
     * and scopes them to the subpanel's container.
     */
    fluid.uiOptions.combinedPanel.surfaceSubpanelRendererSelectors = function (components, selectors) {
        fluid.each(components, function (compOpts, compName) {
            var comp = fluid.defaults(compOpts.type);
            fluid.each(comp.selectors, function (selector, selName) {
                if (!comp.selectorsToIgnore || $.inArray(selName, comp.selectorsToIgnore) < 0) {
                    fluid.set(selectors,  compName + "_" + selName, selectors[compName] + " " + selector);
                }
            });
        });
    };

    fluid.uiOptions.combinedPanel.rebaseProtoTree = function (protoTree, selectors, memberName) {
        var rules = {};
        var rebased = fluid.copy(protoTree);
        fluid.each(rebased, function (value, key) {
            if ($.inArray(key, selectors)) {
                rules[memberName + "_" + key] = key;
            } else {
                rules[key] = key;
            }
            if (typeof value === "object" && !fluid.isArrayable(value)) {
                rebased[key] = fluid.uiOptions.combinedPanel.rebaseProtoTree(value, selectors, memberName);
            }
        });
        return fluid.model.transform(rebased, rules);
    };

    /********************************
     * UI Options Text Field Slider *
     ********************************/

    fluid.defaults("fluid.uiOptions.textfieldSlider", {
        gradeNames: ["fluid.textfieldSlider", "autoInit"],
        model: "{fluid.uiOptions.panel}.model",
        range: "{fluid.uiOptions.panel}.options.range",
        listeners: {
            modelChanged: {
                listener: "{fluid.uiOptions.panel}.applier.requestChange",
                args: ["{that}.options.path", "{arguments}.0"]
            }
        },
        path: "value",
        sliderOptions: "{fluid.uiOptions.panel}.options.sliderOptions"
    });

    /**************************************
     * Functions shared by several panels *
     **************************************/

    fluid.uiOptions.panel.lookupMsg = function (messageResolver, prefix, values) {
        var messages = [];
        fluid.each(values, function (value, key) {
            var looked = messageResolver.lookup([prefix + "." + value]);
            messages.push(looked ? looked.template : looked);
        });
        return messages;
    };

    /************************
     * UI Options Text Size *
     ************************/

    /**
     * A sub-component of fluid.uiOptions that renders the "text size" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.panel.textSize", {
        gradeNames: ["fluid.uiOptions.panel", "autoInit"],
        preferenceMap: {
            "fluid.uiOptions.textSize": {
                "model.value": "default",
                "range.min": "minimum",
                "range.max": "maximum"
            }
        },
        // The default model values represent both the expected format as well as the setting to be applied in the absence of values passed down to the component.
        // i.e. from the settings store, or specific defaults derived from schema.
        // Note: Except for being passed down to its subcomponent, these default values are not contributed and shared out
        range: {
            min: 1,
            max: 2
        },
        selectors: {
            textSize: ".flc-uiOptions-min-text-size",
            label: ".flc-uiOptions-min-text-size-label",
            smallIcon: ".flc-uiOptions-min-text-size-smallIcon",
            largeIcon: ".flc-uiOptions-min-text-size-largeIcon",
            multiplier: ".flc-uiOptions-multiplier"
        },
        protoTree: {
            label: {messagekey: "textSizeLabel"},
            smallIcon: {messagekey: "textSizeSmallIcon"},
            largeIcon: {messagekey: "textSizeLargeIcon"},
            multiplier: {messagekey: "multiplier"},
            textSize: {
                decorators: {
                    type: "fluid",
                    func: "fluid.uiOptions.textfieldSlider"
                }
            }
        },
        sliderOptions: {
            orientation: "horizontal",
            step: 0.1,
            range: "min"
        }
    });

    /************************
     * UI Options Text Font *
     ************************/

    /**
     * A sub-component of fluid.uiOptions that renders the "text font" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.panel.textFont", {
        gradeNames: ["fluid.uiOptions.panel", "autoInit"],
        preferenceMap: {
            "fluid.uiOptions.textFont": {
                "model.value": "default",
                "controlValues.textFont": "enum"
            }
        },
        selectors: {
            textFont: ".flc-uiOptions-text-font",
            label: ".flc-uiOptions-text-font-label"
        },
        strings: {
            textFont: {
                expander: {
                    func: "fluid.uiOptions.panel.lookupMsg",
                    args: ["{that}.options.parentBundle", "textFont", "{that}.options.controlValues.textFont"]
                }
            }
        },
        protoTree: {
            label: {messagekey: "textFontLabel"},
            textFont: {
                optionnames: "${{that}.options.strings.textFont}",
                optionlist: "${{that}.options.controlValues.textFont}",
                selection: "${value}",
                decorators: {
                    type: "fluid",
                    func: "fluid.uiOptions.selectDecorator",
                    options: {
                        styles: "{that}.options.classnameMap.textFont"
                    }
                }
            }
        },
        classnameMap: null, // must be supplied by implementors
        controlValues: {
            textFont: ["default", "times", "comic", "arial", "verdana"]
        }
    });

    /*************************
     * UI Options Line Space *
     *************************/

    /**
     * A sub-component of fluid.uiOptions that renders the "line space" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.panel.lineSpace", {
        gradeNames: ["fluid.uiOptions.panel", "autoInit"],
        preferenceMap: {
            "fluid.uiOptions.lineSpace": {
                "model.value": "default",
                "range.min": "minimum",
                "range.max": "maximum"
            }
        },
        // The default model values represent both the expected format as well as the setting to be applied in the absence of values passed down to the component.
        // i.e. from the settings store, or specific defaults derived from schema.
        // Note: Except for being passed down to its subcomponent, these default values are not contributed and shared out
        range: {
            min: 1,
            max: 2
        },
        selectors: {
            lineSpace: ".flc-uiOptions-line-space",
            label: ".flc-uiOptions-line-space-label",
            narrowIcon: ".flc-uiOptions-line-space-narrowIcon",
            wideIcon: ".flc-uiOptions-line-space-wideIcon",
            multiplier: ".flc-uiOptions-multiplier"
        },
        protoTree: {
            label: {messagekey: "lineSpaceLabel"},
            narrowIcon: {messagekey: "lineSpaceNarrowIcon"},
            wideIcon: {messagekey: "lineSpaceWideIcon"},
            multiplier: {messagekey: "multiplier"},
            lineSpace: {
                decorators: {
                    type: "fluid",
                    func: "fluid.uiOptions.textfieldSlider"
                }
            }
        },
        sliderOptions: {
            orientation: "horizontal",
            step: 0.1,
            range: "min"
        }
    });

    /***********************
     * UI Options Contrast *
     ***********************/

    /**
     * A sub-component of fluid.uiOptions that renders the "contrast" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.panel.contrast", {
        gradeNames: ["fluid.uiOptions.panel", "autoInit"],
        preferenceMap: {
            "fluid.uiOptions.contrast": {
                "model.value": "default",
                "controlValues.theme": "enum"
            }
        },
        listeners: {
            afterRender: "{that}.style"
        },
        selectors: {
            themeRow: ".flc-uiOptions-themeRow",
            themeLabel: ".flc-uiOptions-theme-label",
            themeInput: ".flc-uiOptions-themeInput",
            label: ".flc-uiOptions-contrast-label"
        },
        strings: {
            theme: {
                expander: {
                    func: "fluid.uiOptions.panel.lookupMsg",
                    args: ["{that}.options.parentBundle", "contrast", "{that}.options.controlValues.theme"]
                }
            }
        },
        repeatingSelectors: ["themeRow"],
        protoTree: {
            label: {messagekey: "contrastLabel"},
            expander: {
                type: "fluid.renderer.selection.inputs",
                rowID: "themeRow",
                labelID: "themeLabel",
                inputID: "themeInput",
                selectID: "theme-radio",
                tree: {
                    optionnames: "${{that}.options.strings.theme}",
                    optionlist: "${{that}.options.controlValues.theme}",
                    selection: "${value}"
                }
            }
        },
        controlValues: {
            theme: ["default", "bw", "wb", "by", "yb", "lgdg"]
        },
        markup: {
            label: "<span class=\"fl-preview-A\">A</span><span class=\"fl-hidden-accessible\">%theme</span><div class=\"fl-crossout\"></div>"
        },
        invokers: {
            style: {
                funcName: "fluid.uiOptions.panel.contrast.style",
                args: ["{that}.dom.themeLabel", "{that}.options.strings.theme",
                    "{that}.options.markup.label", "{that}.options.controlValues.theme",
                    "{that}.options.classnameMap.theme"]
            }
        }
    });

    fluid.uiOptions.panel.contrast.style = function (labels, strings, markup, theme, style) {
        fluid.each(labels, function (label, index) {
            label = $(label);
            label.html(fluid.stringTemplate(markup, {
                theme: strings[index]
            }));
            label.addClass(style[theme[index]]);
        });
    };

    /******************************
     * UI Options Layout Controls *
     ******************************/

    /**
     * A sub-component of fluid.uiOptions that renders the "layout and navigation" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.panel.layoutControls", {
        gradeNames: ["fluid.uiOptions.panel", "autoInit"],
        preferenceMap: {
            "fluid.uiOptions.tableOfContents": {
                "model.toc": "default"
            }
        },
        selectors: {
            toc: ".flc-uiOptions-toc",
            label: ".flc-uiOptions-toc-label",
            choiceLabel: ".flc-uiOptions-toc-choice-label"
        },
        protoTree: {
            label: {messagekey: "tocLabel"},
            choiceLabel: {messagekey: "tocChoiceLabel"},
            toc: "${toc}"
        }
    });

    /*****************************
     * UI Options Links Controls *
     *****************************/
    /**
     * A sub-component of fluid.uiOptions that renders the "links and buttons" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.panel.linksControls", {
        gradeNames: ["fluid.uiOptions.panel", "autoInit"],
        preferenceMap: {
            "fluid.uiOptions.emphasizeLinks": {
                "model.links": "default"
            },
            "fluid.uiOptions.inputsLarger": {
                "model.inputsLarger": "default"
            }
        },
        selectors: {
            links: ".flc-uiOptions-links",
            inputsLarger: ".flc-uiOptions-inputs-larger",
            label: ".flc-uiOptions-links-label",
            linksChoiceLabel: ".flc-uiOptions-links-choice-label",
            inputsChoiceLabel: ".flc-uiOptions-links-inputs-choice-label"
        },
        protoTree: {
            label: {messagekey: "linksLabel"},
            linksChoiceLabel: {messagekey: "linksChoiceLabel"},
            inputsChoiceLabel: {messagekey: "inputsChoiceLabel"},
            links: "${links}",
            inputsLarger: "${inputsLarger}"
        }
    });

    /************************************************
     * UI Options Select Dropdown Options Decorator *
     ************************************************/

    /**
     * A sub-component that decorates the options on the select dropdown list box with the css style
     */
    fluid.defaults("fluid.uiOptions.selectDecorator", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        listeners: {
            onCreate: "fluid.uiOptions.selectDecorator.decorateOptions"
        },
        styles: {
            preview: "fl-preview-theme"
        }
    });

    fluid.uiOptions.selectDecorator.decorateOptions = function (that) {
        fluid.each($("option", that.container), function (option) {
            var styles = that.options.styles;
            $(option).addClass(styles.preview + " " + styles[fluid.value(option)]);
        });
    };

})(jQuery, fluid_1_5);
