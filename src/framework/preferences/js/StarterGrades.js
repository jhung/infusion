/*
Copyright 2013-2015 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_2_0 = fluid_2_0 || {};

(function ($, fluid) {
    "use strict";

    /*******************************************************************************
     * Starter Root Model
     *
     * Provides the default values for the starter enhancer/panels models
     *******************************************************************************/

    fluid.defaults("fluid.prefs.initialModel.starter", {
        gradeNames: ["fluid.prefs.initialModel", "autoInit"],
        members: {
            // TODO: This information is supposed to be generated from the JSON
            // schema describing various preferences. For now it's kept in top
            // level prefsEditor to avoid further duplication.
            initialModel: {
                preferences: {
                    textFont: "default",          // key from classname map
                    theme: "default",             // key from classname map
                    textSize: 1,                  // in points
                    lineSpace: 1,                 // in ems
                    toc: false,                  // boolean
                    links: false,                // boolean
                    inputsLarger: false          // boolean
                }
            }
        }
    });

    /*******************************************************************************
     * CSSClassEnhancerBase
     *
     * Provides the map between the settings and css classes to be applied.
     * Used as a UIEnhancer base grade that can be pulled in as requestd.
     *******************************************************************************/

    fluid.defaults("fluid.uiEnhancer.cssClassEnhancerBase", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        classnameMap: {
            "textFont": {
                "default": "",
                "times": "fl-font-times",
                "comic": "fl-font-comic-sans",
                "arial": "fl-font-arial",
                "verdana": "fl-font-verdana"
            },
            "theme": {
                "default": "fl-theme-prefsEditor-default",
                "bw": "fl-theme-prefsEditor-bw fl-theme-bw",
                "wb": "fl-theme-prefsEditor-wb fl-theme-wb",
                "by": "fl-theme-prefsEditor-by fl-theme-by",
                "yb": "fl-theme-prefsEditor-yb fl-theme-yb",
                "lgdg": "fl-theme-prefsEditor-lgdg fl-theme-lgdg"
            },
            "links": "fl-link-enhanced",
            "inputsLarger": "fl-text-larger"
        }
    });

    /*******************************************************************************
     * BrowserTextEnhancerBase
     *
     * Provides the default font size translation between the strings and actual pixels.
     * Used as a UIEnhancer base grade that can be pulled in as requestd.
     *******************************************************************************/

    fluid.defaults("fluid.uiEnhancer.browserTextEnhancerBase", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        fontSizeMap: {
            "xx-small": "9px",
            "x-small":  "11px",
            "small":    "13px",
            "medium":   "15px",
            "large":    "18px",
            "x-large":  "23px",
            "xx-large": "30px"
        }
    });

    /*******************************************************************************
     * UI Enhancer Starter Enactors
     *
     * A grade component for UIEnhancer. It is a collection of default UI Enhancer
     * action ants.
     *******************************************************************************/

    fluid.defaults("fluid.uiEnhancer.starterEnactors", {
        gradeNames: ["fluid.uiEnhancer", "fluid.uiEnhancer.cssClassEnhancerBase", "fluid.uiEnhancer.browserTextEnhancerBase", "autoInit"],
        model: "{fluid.prefs.initialModel}.initialModel.preferences",
        components: {
            textSize: {
                type: "fluid.prefs.enactor.textSize",
                container: "{uiEnhancer}.container",
                options: {
                    fontSizeMap: "{uiEnhancer}.options.fontSizeMap",
                    model: {
                        value: "{uiEnhancer}.model.textSize"
                    }
                }
            },
            textFont: {
                type: "fluid.prefs.enactor.textFont",
                container: "{uiEnhancer}.container",
                options: {
                    classes: "{uiEnhancer}.options.classnameMap.textFont",
                    model: {
                        value: "{uiEnhancer}.model.textFont"
                    }
                }
            },
            lineSpace: {
                type: "fluid.prefs.enactor.lineSpace",
                container: "{uiEnhancer}.container",
                options: {
                    fontSizeMap: "{uiEnhancer}.options.fontSizeMap",
                    model: {
                        value: "{uiEnhancer}.model.lineSpace"
                    }
                }
            },
            contrast: {
                type: "fluid.prefs.enactor.contrast",
                container: "{uiEnhancer}.container",
                options: {
                    classes: "{uiEnhancer}.options.classnameMap.theme",
                    model: {
                        value: "{uiEnhancer}.model.theme"
                    }
                }
            },
            emphasizeLinks: {
                type: "fluid.prefs.enactor.emphasizeLinks",
                container: "{uiEnhancer}.container",
                options: {
                    cssClass: "{uiEnhancer}.options.classnameMap.links",
                    model: {
                        value: "{uiEnhancer}.model.links"
                    }
                }
            },
            inputsLarger: {
                type: "fluid.prefs.enactor.inputsLarger",
                container: "{uiEnhancer}.container",
                options: {
                    cssClass: "{uiEnhancer}.options.classnameMap.inputsLarger",
                    model: {
                        value: "{uiEnhancer}.model.inputsLarger"
                    }
                }
            },
            tableOfContents: {
                type: "fluid.prefs.enactor.tableOfContents",
                container: "{uiEnhancer}.container",
                options: {
                    tocTemplate: "{uiEnhancer}.options.tocTemplate",
                    model: {
                        toc: "{uiEnhancer}.model.toc"
                    }
                }
            }
        }
    });

    /*********************************************************************************************************
     * Starter Settings Panels
     *
     * A collection of all the default Preferences Editorsetting panels.
     *********************************************************************************************************/
    fluid.defaults("fluid.prefs.starterPanels", {
        gradeNames: ["fluid.prefs.prefsEditor", "autoInit"],
        selectors: {
            textSize: ".flc-prefsEditor-text-size",
            textFont: ".flc-prefsEditor-text-font",
            lineSpace: ".flc-prefsEditor-line-space",
            contrast: ".flc-prefsEditor-contrast",
            textControls: ".flc-prefsEditor-text-controls",
            layoutControls: ".flc-prefsEditor-layout-controls",
            linksControls: ".flc-prefsEditor-links-controls"
        },
        components: {
            textSize: {
                type: "fluid.prefs.panel.textSize",
                container: "{prefsEditor}.dom.textSize",
                createOnEvent: "onPrefsEditorMarkupReady",
                options: {
                    gradeNames: "fluid.prefs.prefsEditorConnections",
                    model: {
                        textSize: "{prefsEditor}.model.preferences.textSize"
                    },
                    messageBase: "{messageLoader}.resources.textSize.resourceText",
                    resources: {
                        template: "{templateLoader}.resources.textSize"
                    }
                }
            },
            lineSpace: {
                type: "fluid.prefs.panel.lineSpace",
                container: "{prefsEditor}.dom.lineSpace",
                createOnEvent: "onPrefsEditorMarkupReady",
                options: {
                    gradeNames: "fluid.prefs.prefsEditorConnections",
                    model: {
                        lineSpace: "{prefsEditor}.model.preferences.lineSpace"
                    },
                    messageBase: "{messageLoader}.resources.lineSpace.resourceText",
                    resources: {
                        template: "{templateLoader}.resources.lineSpace"
                    }
                }
            },
            textFont: {
                type: "fluid.prefs.panel.textFont",
                container: "{prefsEditor}.dom.textFont",
                createOnEvent: "onPrefsEditorMarkupReady",
                options: {
                    gradeNames: "fluid.prefs.prefsEditorConnections",
                    classnameMap: "{uiEnhancer}.options.classnameMap",
                    model: {
                        value: "{prefsEditor}.model.preferences.textFont"
                    },
                    messageBase: "{messageLoader}.resources.textFont.resourceText",
                    resources: {
                        template: "{templateLoader}.resources.textFont"
                    }
                }
            },
            contrast: {
                type: "fluid.prefs.panel.contrast",
                container: "{prefsEditor}.dom.contrast",
                createOnEvent: "onPrefsEditorMarkupReady",
                options: {
                    gradeNames: "fluid.prefs.prefsEditorConnections",
                    classnameMap: "{uiEnhancer}.options.classnameMap",
                    model: {
                        value: "{prefsEditor}.model.preferences.theme"
                    },
                    messageBase: "{messageLoader}.resources.contrast.resourceText",
                    resources: {
                        template: "{templateLoader}.resources.contrast"
                    }
                }
            },
            layoutControls: {
                type: "fluid.prefs.panel.layoutControls",
                container: "{prefsEditor}.dom.layoutControls",
                createOnEvent: "onPrefsEditorMarkupReady",
                options: {
                    gradeNames: "fluid.prefs.prefsEditorConnections",
                    model: {
                        toc: "{prefsEditor}.model.preferences.toc"
                    },
                    messageBase: "{messageLoader}.resources.layoutControls.resourceText",
                    resources: {
                        template: "{templateLoader}.resources.layoutControls"
                    }
                }
            },
            linksControls: {
                type: "fluid.prefs.panel.linksControls",
                container: "{prefsEditor}.dom.linksControls",
                createOnEvent: "onPrefsEditorMarkupReady",
                options: {
                    gradeNames: "fluid.prefs.prefsEditorConnections",
                    selectors: {
                        emphasizeLinks: ".flc-prefsEditor-emphasizeLinks",
                        inputsLarger: ".flc-prefsEditor-inputsLarger"
                    },
                    selectorsToIgnore: ["emphasizeLinks", "inputsLarger"],
                    model: {
                        fluid_prefs_emphasizeLinks: "{prefsEditor}.model.preferences.links",
                        fluid_prefs_inputsLarger: "{prefsEditor}.model.preferences.inputsLarger"
                    },
                    components: {
                        emphasizeLinks: {
                            type: "fluid.prefs.panel.emphasizeLinks",
                            container: "{that}.dom.emphasizeLinks",
                            createOnEvent: "initSubPanels",
                            options: {
                                messageBase: "{messageLoader}.resources.emphasizeLinks.resourceText"
                            }
                        },
                        inputsLarger: {
                            type: "fluid.prefs.panel.inputsLarger",
                            container: "{that}.dom.inputsLarger",
                            createOnEvent: "initSubPanels",
                            options: {
                                messageBase: "{messageLoader}.resources.inputsLarger.resourceText"
                            }
                        }
                    },
                    messageBase: "{messageLoader}.resources.linksControls.resourceText",
                    resources: {
                        template: "{templateLoader}.resources.linksControls",
                        emphasizeLinks: "{templateLoader}.resources.emphasizeLinks",
                        inputsLarger: "{templateLoader}.resources.inputsLarger"
                    }
                }
            }
        }
    });

    /******************************
     * Starter Template Loader
     ******************************/

    /**
     * A template loader component that expands the resources blocks for loading resources used by starterPanels
     *
     * @param {Object} options
     */

    fluid.defaults("fluid.prefs.starterTemplateLoader", {
        gradeNames: ["fluid.prefs.resourceLoader", "autoInit"],
        resources: {
            textSize: "%prefix/PrefsEditorTemplate-textSize.html",
            textFont: "%prefix/PrefsEditorTemplate-textFont.html",
            lineSpace: "%prefix/PrefsEditorTemplate-lineSpace.html",
            contrast: "%prefix/PrefsEditorTemplate-contrast.html",
            layoutControls: "%prefix/PrefsEditorTemplate-layout.html",
            linksControls: "%prefix/PrefsEditorTemplate-linksControls.html",
            emphasizeLinks: "%prefix/PrefsEditorTemplate-emphasizeLinks.html",
            inputsLarger: "%prefix/PrefsEditorTemplate-inputsLarger.html"
        }
    });

    fluid.defaults("fluid.prefs.starterSeparatedPanelTemplateLoader", {
        gradeNames: ["fluid.prefs.starterTemplateLoader", "autoInit"],
        resources: {
            prefsEditor: "%prefix/SeparatedPanelPrefsEditor.html"
        }
    });

    fluid.defaults("fluid.prefs.starterFullPreviewTemplateLoader", {
        gradeNames: ["fluid.prefs.starterTemplateLoader", "autoInit"],
        resources: {
            prefsEditor: "%prefix/FullPreviewPrefsEditor.html"
        }
    });

    fluid.defaults("fluid.prefs.starterFullNoPreviewTemplateLoader", {
        gradeNames: ["fluid.prefs.starterTemplateLoader", "autoInit"],
        resources: {
            prefsEditor: "%prefix/FullNoPreviewPrefsEditor.html"
        }
    });

    /******************************
     * Starter Message Loader
     ******************************/

    /**
     * A message loader component that expands the resources blocks for loading messages for starter panels
     *
     * @param {Object} options
     */

    fluid.defaults("fluid.prefs.starterMessageLoader", {
        gradeNames: ["fluid.prefs.resourceLoader", "autoInit"],
        resources: {
            prefsEditor: "%prefix/prefsEditor.json",
            textSize: "%prefix/textSize.json",
            textFont: "%prefix/textFont.json",
            lineSpace: "%prefix/lineSpace.json",
            contrast: "%prefix/contrast.json",
            layoutControls: "%prefix/tableOfContents.json",
            linksControls: "%prefix/linksControls.json",
            emphasizeLinks: "%prefix/emphasizeLinks.json",
            inputsLarger: "%prefix/inputsLarger.json"
        }
    });

})(jQuery, fluid_2_0);
