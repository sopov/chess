$(function () {
    "use strict";
    let lessons = {
        cache: {},
        state: {},
        data: {},
        init: function () {
            let t = this;
            $.ajax(
                "./list.json",

            ).done(function (data) {
                t.data = data;
                dom.sidebar.init();
            });
        },
        load: function (id, cb, fb) {
            console.log("load", id)
            $.ajax(
                "./lessons/" + id + ".json", {
                    cache: true,
                    async: true,
                    error: function (xhr, status) {
                        if (fb) {
                            fb("Ошибка " + xhr.status, "При загрузке урока, произошла ошибка: " + xhr.statusText + ".")
                        }
                    }
                }
            ).done(function (data) {
                console.log(typeof data)
                if (typeof data === typeof {}) {
                    lessons.cache[id] = data;
                    if (cb) {
                        cb()
                    }
                } else if (fb) {
                    fb()
                }
            })
        },
        view: function (id) {
            let t = this;
            if (typeof lessons.cache[id] !== typeof {}) {
                return this.load(id, function () {
                        t.view(id)
                    },
                    function (title, text) {
                        let el = $("#lesson-" + id);
                        if (!title) {
                            title = "Ошибка"
                        }
                        if (!text) {
                            text = "Возникли проблемы при загрузке"
                        }
                        el.html("");
                        el.parent().attr("class", "")
                        el.attr({
                            class: "alert alert-warning my-3",
                            role: "alert"
                        }).append(
                            $("<h4>").attr({
                                class: "alert-heading"
                            }).text(title),
                            $("<p>").text(text)
                        );
                        lessons.update_count_down();
                    })
            }
            let cache = lessons.cache[id],
                e = $('#lesson-' + id);
            if (e.length > 0) {
                let left = $("<div>").attr({
                        class: "col-md-6"
                    }).append(
                        $("<div>").attr({
                            class: "h-100 p-5"
                        }).append(
                            $('<h2>').text(cache.title),
                            $('<p>').html(cache.description)
                        )
                    ),
                    right = $("<div>").attr({
                        class: "col-md-6"
                    }).append(
                        $("<div>").attr({
                            class: "h-100 p-5"
                        }).append(
                            $("<ul>").attr({
                                class: "nav nav-tabs",
                                role: "tablist"
                            }).append(
                                t.view_tabs(lessons.cache[id])
                            ),
                            $("<div>").attr({
                                class: "tab-content"
                            }).append(
                                t.view_tabs_content(lessons.cache[id])
                            )
                        )
                    );
                e.html("");
                e.append(
                    left,
                    right
                );

                this.update_count_down()

            }

        },
        update_count_down: function () {
            // let 
            // total = $(".lessons").length,
            // loaded = total-$(".downloader").length;


            // $("#count-down").text(loaded + "/"+total)
            // if (loaded === total) {
            //     $(window).scrollTop( $("#count-down").parent().height() );
            //     setTimeout(function() { $("#count-down").parent().hide() }, 2000)
            // }
        },
        add_tab: function (id, idx, title, active) {
            let cl = active ? " active" : "",
                selected = active ? "true" : "false";
            return $("<li>").attr({
                class: "nav-item",
                role: "presentation"
            }).append(
                $("<button>").attr({
                    "class": "nav-link" + cl,
                    "id": "tc-" + id + "-" + idx + "-tab",
                    "data-bs-toggle": "tab",
                    "data-bs-target": "#tc-" + id + "-" + idx,
                    "type": "button",
                    "role": "tab",
                    "aria-controls": "tc-" + id + "-" + idx,
                    "aria-selected": selected
                }).text(title)
            )
        },
        view_tabs: function (element) {
            let t = this,
                list = [],
                active = true;
            if (element.video) {
                list.push(
                    t.add_tab(element.id, "video", "Видео", active)
                );
                active = false;
            }
            if (element.questions && element.questions.length > 0) {
                element.questions.forEach(function (question, idx) {
                    let title = "#" + (idx + 1);
                    if (element.questions.length === 1) {
                        title = "Задача"
                    }
                    list.push(
                        t.add_tab(element.id, idx, title, active)
                    );
                    active = false;
                })

            }
            return list;
        },
        add_tabcontent: function (id, idx, content, active) {
            let cl = active ? "show active" : ""
            return $("<div>").attr({
                "class": "tab-pane fade" + cl,
                "id": "tc-" + id + "-" + idx,
                "role": "tabpanel",
                "aria-labelledby": "tc-" + id + "-" + idx + "-tab"
            }).append(content)
        },
        view_tabs_content: function (element) {
            let t = this,
                list = [],
                active = true;
            if (element.video) {
                let poster = "";
                if (element.fen) {
                    poster = "https://www.chess.com/dynboard?fen=" + element.fen + "&piece=classic&size=3";
                }
                let video = $("<div>").attr({
                    class: "embed-responsive embed-responsive-1by1"
                }).append(
                    $("<video>").attr({
                        poster: poster,
                        "preload": "metadata",
                        "controls": true,
                        "autoplay": false,
                        class: "video-js lazy",
                        "data-setup": '{}'
                    }).append(
                        $("<source>").attr({
                            "src": element.video
                        })

                    )
                )
                list.push(
                    t.add_tabcontent(element.id, "video", video, active)
                );
                active = false;
            }
            if (element.questions && element.questions.length > 0) {
                element.questions.forEach(function (question, idx) {
                    let content = $('<xmp>').html(question);
                    // content = '<iframe id="8758473" allowtransparency="true" frameborder="0" style="width:100%;border:none;" src="//www.chess.com/emboard?id=8758473"></iframe>'
                    list.push(
                        t.add_tabcontent(element.id, idx, content, active)
                    );
                    active = false;
                })

            }
            return list;
        },
    }

    let dom = {
        text: {
            lesson: function (count) {
                switch (true) {
                    case /[05-9]$/.test(count):
                    case /1[0-9]$/.test(count):
                        return count + " уроков"
                    case /1$/.test(count):
                        return count + " урок"
                    default:
                        return count + " урока"
                }
            },
            skills: function (skills) {
                let list = [];
                skills.forEach(function (skill) {
                    list.push($("<span>").attr({
                        class: "icon-font-chess course-info-icon-skills " + skill + "-black mx-1"
                    }))
                })
                return list;
            }
        },
        main: {
            _element: undefined,
            _preload: [],
            element: function () {
                if (typeof this._element === typeof undefined) {
                    this._element = $('#main');
                }
                return this._element
            },
            append: function () {
                let t = this;
                // this.element().append(Array.from(arguments))
                // this._preload.push(Array.from(arguments))
                Array.from(arguments).forEach(function (e) {
                    console.log("append ", e)
                    t._preload.push(e)
                })

            },
            html: function (html) {
                // this.element().html(html)
                this._preload = [html];
            },
            cleanup: function (html) {
                this.element().html("")
                this._preload = [];
            },
            flush: function () {
                this.element().html("")
                this.element().append(this._preload);
                this._preload = [];
            }
        },
        sidebar: {
            elements: {
                "all": "Все уроки",
                "base": "Основной курс"
            },
            _element: undefined,
            element: function () {
                if (typeof this._element === typeof undefined) {
                    this._element = $('#sidebar');
                }
                return this._element
            },
            cleanup: function () {
                this.element().html("");
            },
            init: function () {
                let t = this;
                t.cleanup();
                ["base", "all"].forEach(
                    function (e) {
                        t.add_group(e)
                    }
                );
                t.view("base", "0")
            },
            add_group: function (group) {
                let t = this;
                this.element().append(
                    t.header(t.elements[group]),
                    t.categories(group)
                )
            },
            header: function (title) {
                return $('<h6>').attr({
                    class: "sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted"
                }).text(title)
            },
            categories: function (group) {

                let t = this,
                    cats = $("<ul>").attr({
                        class: "nav flex-column"
                    });


                lessons.data[group].forEach(
                    function (element, index) {
                        cats.append(
                            t.category(group, index, element.category.replace(/\s\(.*/, ""))
                        )
                    }
                )
                return cats;
            },
            category: function (group, index, title) {
                let t = this;
                return $("<li>").attr({
                    class: "nav-item"
                }).append(
                    $("<a>").attr({
                        class: "nav-link",
                        href: "#",
                        group: group,
                        idx: index,
                        id: "menu-" + group + "-" + index
                    }).text(
                        title
                    ).on("click", function () {
                        t.view(group, index)
                    })
                )
            },
            view: function (group, index) {
                $(".nav-link.active").removeClass("active");
                $("#menu-" + group + "-" + index).addClass("active");
                dom.category.view(group, index)
            }
        },
        category: {
            view: function (group, index) {
                let t = this;
                dom.main.cleanup();
                dom.main.append(
                    $('<h1>').text(
                        lessons.data[group][index].category
                    ),
                    $('<hr>'),
                    t.list(group, index)
                );
                dom.main.flush();
            },
            list: function (group, index) {
                let t = this,
                    list = $("<div>").attr({
                        class: "row",
                        "data-masonry": "{'percentPosition': true }"
                    });
                lessons.data[group][index].courses.forEach(function (element, course) {
                    list.append(
                        t.card(group, index, element, course)
                    )
                })
                return list
            },
            card: function (group, category, element, course) {
                let img = "";
                if (typeof element.img === typeof "") {
                    img = $("<img>").attr({
                        src: element.img,
                        srcset: element.img2x
                    })
                }
                return $("<div>").attr({
                    class: "col-sm-6 col-lg-4 mb-4 pointer"
                }).append(
                    $("<div>").attr({
                        class: "card"
                    }).append(
                        img,
                        $("<div>").attr({
                            class: "card-body"
                        }).append(
                            $("<h5>").attr({
                                class: "card-title"
                            }).text(element.title),
                            $("<p>").attr({
                                class: "card-text"
                            }).html(element.description),
                            $("<p>").attr({
                                class: "card-text"
                            }).append(
                                $("<small>").attr({
                                    class: "text-muted"
                                }).append(
                                    dom.text.skills(element.skills),
                                    element.level,
                                    ', ',
                                    dom.text.lesson(element.lessons.length)
                                )
                            )
                        )
                    )
                ).on("click", function () {
                    dom.lessons.view(element)
                })
            }
        },
        lessons: {
            view: function (element) {
                let description = $("<div>").attr({
                    class: "row align-items-md-stretch"
                });

                let descriptioncnt = 12;
                if (typeof element.img === typeof "") {
                    descriptioncnt = 6;
                    description.append(
                        $("<div>").attr({
                            class: "d-md-none d-lg-block col-md-6"
                        }).append(
                            $("<div>").attr({
                                class: "h-100 p-5 text-white bg-dark rounded-3 img200",
                                src: element.img,
                            }).append(
                                $("<img>").attr({
                                    src: element.img,
                                    srcset: element.img2x
                                })
                            )
                        )
                    )
                }

                description.append(
                    $("<div>").attr({
                        class: "col-md-12 col-lg-" + descriptioncnt
                    }).append(
                        $("<div>").attr({
                            class: "h-100 p-5 bg-light border rounded-3"
                        }).append(
                            $('<h2>').text(element.title),
                            $('<p>').html(element.description)
                        )
                    )
                )

                dom.main.cleanup();
                // dom.main.append(
                //     $("<div>").attr({
                //         style: "width:" + $(window).width() + "px; " +
                //             "height:" + $(window).height() + "px; " +
                //             "display: table-cell; text-align: center; vertical-align: middle",
                //     }).append(
                //         $("<div>").attr({
                //             class: "spinner-border m-5",
                //             role: "status"
                //         }).append(
                //             $("<span>").attr({
                //                 class: "visually-hidden"
                //             }).text("Загружаем..")
                //         ),
                //         $("<h1>").attr({
                //             id: "count-down"
                //         }).text("Загружаем")
                //     )
                // );
                dom.main.append(
                    // $("<h1>").text(element.title),
                    // $('<hr>'),
                    description
                )

                element.lessons.forEach(function (id) {
                    dom.main.append(
                        $('<div>').attr({
                            class: "my-3 bg-light border rounded-3"
                        }).append(
                            $('<div>').attr({
                                id: "lesson-" + id,
                                class: "row align-items-md-stretch lessons"
                            }).append(
                                $("<div>").attr({
                                    class: "spinner-border m-5 downloader",
                                    role: "status"
                                }).append(
                                    $("<span>").attr({
                                        class: "visually-hidden"
                                    }).text("Загружаем..")
                                )
                            )
                        ))
                    // lessons.view(id)
                    // lessons.view(id)

                })

                dom.main.flush()
                // setTimeout(function () {
                element.lessons.forEach(function (id) {
                    lessons.view(id)
                })
                // }, 2000)
                // setTimeout( function() {dom.main.flush()}, 2000);

            }
        }
    }

    lessons.init();
});

{
    /* <div class="row align-items-md-stretch">
      <div class="col-md-6">
        <div class="h-100 p-5 text-white bg-dark rounded-3">
          <h2>Change the background</h2>
          <p>Swap the background-color utility and add a `.text-*` color utility to mix up the jumbotron look. Then, mix and match with additional component themes and more.</p>
          <button class="btn btn-outline-light" type="button">Example button</button>
        </div>
      </div>
      <div class="col-md-6">
        <div class="h-100 p-5 bg-light border rounded-3">
          <h2>Add borders</h2>
          <p>Or, keep it light and add a border for some added definition to the boundaries of your content. Be sure to look under the hood at the source HTML here as we've adjusted the alignment and sizing of both column's content for equal-height.</p>
          <button class="btn btn-outline-secondary" type="button">Example button</button>
        </div>
      </div>
    </div>*/
}