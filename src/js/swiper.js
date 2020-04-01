import PhotoSwipe from 'photoswipe/dist/photoswipe'
import PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default'

class Swiper {
    constructor(settings = {}) {
        this.swiper = false;
        this.swiperId = settings.id || '#swiper-js';
        this.swiperWrapper = false;
        this.slides = [];
        this.sources = [];
        this.activeSlide = settings.activeSlide - 1 || 0;
        this.swaping = false;
        this.widthWrapp = 0;
        this.widthSwiper = 0;
        this.zoomX = 0;
        this.maxZoom = 2;
        this.touchRation = settings.touchRation || 200;
        this.timeToSlide = settings.timeToSlide || 600;
        this.timeChangeImg = settings.timeChangeImg || 300;
        this.margin = settings.margin || 0;
        this.pagination = settings.pagination;
        this.settings = settings;
        this.btnPrevNext = settings.pagination;
        this.btnPrev = false;
        this.btnNext = false;
        this.arrPaginationBullet = false;
        this.figureEl = [];
    }

    init() {
        this.swiper = document.querySelector(this.swiperId);
        if (this.swiper) {
            this.swiperWrapper = this.swiper.querySelector('.trueSwiper__wrapper');
            this.widthSwiper= this.swiper.offsetWidth;
            if (this.swiperWrapper) {

                this.slides = this.swiperWrapper.querySelectorAll('.trueSwiper__slide');


                this.mouseDownSlide();     //свайпинг

                this.slides.forEach((slide, index) => {
                    //если есть марджины то ставим
                    if (this.margin) {
                        slide.style.marginRight = this.margin + 'px';
                    }

                    //задержка изменения картинки
                    slide.style.transitionDuration = `${this.timeChangeImg}ms`;

                    //создаем массив обьектов sources
                    let arrSources = slide.querySelectorAll('SOURCE');
                    this.sources.push({
                        sources: arrSources
                    });
                    //задаем начальную ширину свайперу
                    slide.style.width = arrSources[0].dataset.width + 'px';
                    slide.dataset.width = arrSources[0].dataset.width;

                    //считаем всю ширину свайпера
                    this.widthWrapp += (index <= this.slides.length ? +slide.dataset.width + this.margin : 0);


                    this.figureEl.push(slide.querySelector('.trueSwiper__magnifier'));

                    // запрет хватания картинок
                    // slide.querySelector('IMG').addEventListener('mousedown', e => e.preventDefault())
                });
                this.maxZoom = this.sources[0].sources.length - 1;

                this.widthWrapp = this.widthWrapp - 100;



                //делаем активный слайд если не первый
                if (this.activeSlide !== 0 && this.activeSlide < this.slides.length) {
                    this.moveSlide(this.activeSlide);
                }

                //функция зума
                this.handlerZoom();


                //инит фотосвайпа
                this.initPhotoSwipe();
            }

            //если активна пагинация то создаем ее
            if (this.pagination) {
                let pagination = document.createElement('div');
                this.arrPaginationBullet = [];
                pagination.classList.add('trueSwiper__pagination');
                this.slides.forEach((slide, index) => {
                    let paginationBullet = document.createElement('div');
                    this.arrPaginationBullet.push(paginationBullet);
                    if (this.activeSlide === index) {
                        paginationBullet.classList.add('trueSwiper__paginationBullet', 'is-active');
                    } else {
                        paginationBullet.classList.add('trueSwiper__paginationBullet');
                    }
                    pagination.insertAdjacentElement('beforeend', paginationBullet);
                });
                //вставляем в дом собранную пагинацию
                this.swiper.insertAdjacentElement('beforeend', pagination);

                //вешаем события на пагинацию
                this.arrPaginationBullet.forEach((bullet, index) => {
                    bullet.addEventListener('click', e => {
                        if (!e.target.classList.contains('is-active')) {
                            this.moveSlide(index);
                        }
                    })
                })
            }

            //если активны кнопки переходов
            if (this.btnPrevNext) {
                this.btnPrev = document.createElement('div');
                this.btnNext = document.createElement('div');
                this.btnPrev.classList.add('trueSwiper__btnPrev', 'trueSwiper__btn');
                this.btnNext.classList.add('trueSwiper__btnNext', 'trueSwiper__btn');
                this.changeBtnPrevNext(this.activeSlide);
                this.btnPrev.addEventListener('click', e => {
                    this.moveSlide(this.activeSlide - 1)
                });
                this.btnNext.addEventListener('click', e => {
                    this.moveSlide(this.activeSlide + 1)
                });
                this.swiper.insertAdjacentElement('beforeend', this.btnPrev);
                this.swiper.insertAdjacentElement('beforeend', this.btnNext);
            }

        }
    }

    changeBtnPrevNext(index) {
        if (index === 0) {
            this.btnPrev.classList.add('disabled');
            this.btnNext.classList.remove('disabled');
        } else if (this.activeSlide === this.slides.length - 1) {
            this.btnNext.classList.add('disabled');
            this.btnPrev.classList.remove('disabled');
        } else {
            this.btnNext.classList.remove('disabled');
            this.btnPrev.classList.remove('disabled');
        }
    }

    changePagination(index) {


        this.arrPaginationBullet.forEach((bulletClick, bulletIndex) => {
            if (bulletClick.classList.contains('is-active')) {
                bulletClick.classList.remove('is-active');
            }
            if (bulletIndex === index) {
                bulletClick.classList.add('is-active');
            }
        });


    }

    handlerZoom() {
        let vm = this;
        //вешаем события клика на слайд
        this.slides.forEach((slide, index) => {
            slide.addEventListener('click', e => {

                if (!this.swaping && e.target.className === 'trueSwiper__img') {

                    //счетчик зума обновляем
                    let oldZoomX = vm.zoomX;
                    if (vm.zoomX < vm.maxZoom) {
                        vm.zoomX++;
                    } else {
                        vm.zoomX = 0;
                    }

                        //сначала всем сурсам заменеяем адрес, а потом ширину
                    this.sources.forEach((source, indexSource) => {
                        //подставляем новые урлы
                               source.sources[0].srcset = source.sources[vm.zoomX].dataset.srcset;
                    });

                    this.widthWrapp = 0;
                    setTimeout(()=> {
                        this.slides.forEach((slide2, indexSlide) => {

                            slide2.style.width = this.sources[indexSlide].sources[vm.zoomX].dataset.width + 'px';
                            slide2.dataset.width = this.sources[indexSlide].sources[vm.zoomX].dataset.width;
                            //пересчет длины свайпера
                            this.widthWrapp += (indexSlide <= this.slides.length ? +slide2.dataset.width + this.margin : 0);
                        });
                        this.widthWrapp = this.widthWrapp - 100;

                        //  переход к свайперу который увеличился считаем ширину слайдов до него

                        if (oldZoomX < 2) {
                            this.moveSlide(index, 320);
                        } else {
                            this.moveSlide(index, 280);
                        }
                        //показ лупы
                        if (vm.zoomX === 0) {
                            vm.figureEl.forEach(figure => figure.classList.remove('is-active'))
                        } else if (vm.zoomX === 1) {
                            vm.figureEl.forEach(figure => figure.classList.add('is-active'))
                        }

                    },100);



                } else {
                    this.swaping = false;
                }
            });
        });
    }

    moveSlide(index, time = this.timeToSlide) {

        let toIndex = index;
        if (toIndex < 0) {
            toIndex = 0;
        } else if (toIndex+1 > this.slides.length) {
            toIndex = this.slides.length -1;
        }

       // if (index >= 0 && index < this.slides.length) {
            //  переход к свайперу, считаем ширину слайдов до него
            let toTransformX = 0;

            this.activeSlide = toIndex;

            if (toIndex !== 0) {
                for (let i = 0; i < toIndex; i++) {
                    toTransformX += +this.slides[i].dataset.width + this.margin;
                }
                toTransformX = toTransformX * -1;
            }


            //так же изменяем навигацию

            this.changePagination(toIndex);
            this.changeBtnPrevNext(toIndex);

            this.swiperWrapper.style.transitionDuration = `${time}ms`;
            this.swiperWrapper.style.transform = `translateX(${toTransformX}px)`;
      //  }


    }

    mouseDownSlide() {

        let vm = this;
        this.slides.forEach((slide, indexSlide) => {
            slide.addEventListener('mousedown', e => mouseDown(e, indexSlide));
            slide.addEventListener('touchstart', e => mouseDown(e, indexSlide));
        });

        function mouseDown(e, indexSlide) {
            //стартовые позиции
            let startX = e.clientX || e.targetTouches[0].clientX;

            //пройдено пикселей
            let countStep = 0;
            //запоминаем время для вычисления быстрых свайпов
            let dateStart = Date.now();
            let endStart = 0;

            document.addEventListener('mousemove', mouseMove);
            document.addEventListener('touchmove', mouseMove);
            document.addEventListener('mouseup', mouseUp);
            document.addEventListener('touchend', mouseUp);

            let transform = getComputedStyle(vm.swiperWrapper).transform.split(',')[4] || 0;
            if (transform) {
                vm.swiperWrapper.style.transform = `translateX(${transform}px)`;
                vm.swiperWrapper.style.transitionDuration = '0ms';
            }


            //сам свайпинг
            function mouseMove(e) {
                //что бы не отработал зум
                vm.swaping = true;
                //пройденный путь вычисляем
                let clientX = e.clientX || e.targetTouches[0].clientX;
                countStep = clientX - startX;
                //перемещаем свайпер
                vm.swiperWrapper.style.transform = `translateX(${countStep + +transform}px)`;
                vm.swiperWrapper.style.transitionDuration = '0ms';

                //  curTranslateX = clientX - startX + vm.translateX;
            }

            //
            function mouseUp(e) {
                //разница времени нажатия и поднятия кнопки мыши - был ли быстрый свайп
                endStart = Date.now();
                let dateRation = endStart - dateStart;

                //  если был быстрый свайп
                if (dateRation < vm.touchRation && dateRation > 100) {

                    if (countStep < 0) {
                        if (indexSlide + 1 >= vm.slides.length) {
                            vm.moveSlide(vm.slides.length - 1, 300);
                        } else {
                            vm.moveSlide(indexSlide + 1, 300);
                        }

                    } else if (countStep > 0) {

                        if (indexSlide - 1 < 0) {

                            vm.moveSlide(0, 300);
                        } else if (indexSlide - 1 === vm.activeSlide) {

                            vm.moveSlide(indexSlide - 2, 300);
                        } else {

                            vm.moveSlide(indexSlide - 1, 300);
                        }
                    }

                } else if (dateRation < 100) {
                    vm.swaping = false;

                } else {

                    //если вышел за границы свайпер - то возвращаем к 1 или последнему
                    vm.swiperWrapper.style.transitionDuration = `${vm.timeToSlide}ms`;
                    let transform = getComputedStyle(vm.swiperWrapper).transform.split(',')[4] || 0;

                    if (+transform > 0) {

                        vm.moveSlide(0);
                    } else if (+transform < vm.widthWrapp * -1) {
                        vm.moveSlide(vm.slides.length - 1);

                    } else {
                        //также активный слайд определяем
                        let widthWrapp = 0;

                        for (let i = 0; i < vm.slides.length; i++) {
                            widthWrapp += vm.slides[i].offsetWidth + vm.margin;

                            if (+transform * -1 < widthWrapp) {
                                vm.activeSlide = i;
                                break;
                            }
                        }
                        //так же изменяем навигацию
                        vm.changePagination(vm.activeSlide);
                        vm.changeBtnPrevNext(vm.activeSlide);
                    }
                }

                document.removeEventListener('mousemove', mouseMove);
                document.removeEventListener('touchmove', mouseMove);
                document.removeEventListener('mouseup', mouseUp);
                document.removeEventListener('touchend', mouseUp);

            }


        }


    }

    onResize() {
        // let vm = this;
        // window.addEventListener('resize', onResize);
        // let startDocWidth = document.documentElement.clientWidth;
        //
        // function onResize(e) {
        //
        //     vm.swiperWrapper.style.transitionDuration = '0ms';
        //     vm.widthSlide = vm.slides[0].offsetWidth;
        //     vm.translateX = vm.activeSlide * vm.widthSlide * -1;
        //     vm.swiperWrapper.style.transform = `translateX(${vm.translateX - (vm.margin * vm.activeSlide)}px)`;
        //     vm.widthWrapp = 0;
        //     vm.slides.forEach((slide, index) => {
        //         vm.widthWrapp += (index + 1 < vm.slides.length ? slide.offsetWidth + vm.margin : 0);
        //     });
        // }
    }

    initPhotoSwipe() {
        let productSlider = this.swiper;

        let that = this;
        let initPhotoSwipeFromDOM = function (gallerySelector) {
            // parse slide data (url, title, size ...) from DOM elements
            // (children of gallerySelector)
            let parseThumbnailElements = function (el) {
                let thumbElements = el.childNodes,
                    //numNodes = thumbElements.length,
                    numNodes = that.figureEl.length,
                    items = [],
                    figureEl,
                    linkEl,
                    imgEl,
                    size,
                    item;


                for (let i = 0; i < numNodes; i++) {
                    figureEl = that.figureEl[i]; // <figure> element
                    // include only element nodes

                    if (figureEl.tagName !== 'FIGURE') {
                        continue;
                    }
                    linkEl = figureEl.children[0]; // <a> element

                    size = linkEl.getAttribute('data-size').split('x');

                    let dataVideo = linkEl.getAttribute('data-type');
                    // create slide object
                    if (dataVideo === 'video') {
                        item = {
                            html: linkEl.getAttribute('data-video'),
                        }
                    } else {
                        item = {
                            src: linkEl.getAttribute('href'),
                            w: parseInt(size[0], 10),
                            h: parseInt(size[1], 10),
                            title: linkEl.getAttribute('title')
                        };
                    }

                    if (figureEl.children.length > 1) {
                        // <figcaption> content
                        item.title = figureEl.children[1].innerHTML;
                    }
                    if (linkEl.children.length > 0) {
                        // <img> thumbnail element, retrieving thumbnail url
                        // let img = linkEl.children[0].querySelector('img');
                        //
                        // item.msrc = img.getAttribute('src');
                        item.msrc = linkEl.getAttribute('href')
                    }

                    item.el = figureEl; // save link to element for getThumbBoundsFn
                    items.push(item);
                }
                return items;
            };
            // find nearest parent element
            let closest = function closest(el, fn) {
                return el && (fn(el) ? el : closest(el.parentNode, fn));
            };
            // triggers when user clicks on thumbnail
            let onThumbnailsClick = function (e) {

                e = e || window.event;
                e.preventDefault ? e.preventDefault() : e.returnValue = false;
                let eTarget = e.target || e.srcElement;
                // find root element of slide
                let clickedListItem = closest(eTarget, function (el) {
                    return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
                });

                if (!clickedListItem) {
                    return;
                }
                // find index of clicked item by looping through all child nodes
                // alternatively, you may define index via data- attribute
                let clickedGallery = clickedListItem.parentNode,
                   // childNodes = clickedListItem.parentNode.childNodes,
                    childNodes = that.figureEl,
                 //   numChildNodes = childNodes.length,
                    numChildNodes = that.figureEl.length,
                    nodeIndex = 0,
                    index;

                for (let i = 0; i < numChildNodes; i++) {

                    if (childNodes[i].tagName !== 'FIGURE') {
                        continue;
                    }
                    if (childNodes[i] === clickedListItem) {
                        index = nodeIndex;
                        break;
                    }
                    nodeIndex++;
                }
                if (index >= 0) {
                    // open PhotoSwipe if valid index found
                    openPhotoSwipe(index, clickedGallery);
                }
                return false;
            };
            // parse picture index and gallery index from URL (#&pid=1&gid=2)
            let photoswipeParseHash = function () {
                let hash = window.location.hash.substring(1),
                    params = {};
                if (hash.length < 5) {
                    return params;
                }
                let vars = hash.split('&');
                for (let i = 0; i < vars.length; i++) {
                    if (!vars[i]) {
                        continue;
                    }
                    let pair = vars[i].split('=');
                    if (pair.length < 2) {
                        continue;
                    }
                    params[pair[0]] = pair[1];
                }
                if (params.gid) {
                    params.gid = parseInt(params.gid, 10);
                }
                return params;
            };
            let openPhotoSwipe = function (index, galleryElement, disableAnimation, fromURL) {
                let pswpElement = that.swiper.querySelector('.pswp'),
                    gallery,
                    options,
                    items;

                items = parseThumbnailElements(galleryElement);
                // define options (if needed)
                options = {
                    loop: false,
                    hideAnimationDuration: 0,
                    showAnimationDuration: 0,
                    // define gallery index (for URL)
                    galleryUID: galleryElement.getAttribute('data-pswp-uid'),
                    getThumbBoundsFn: function (index) {
                        // See Options -> getThumbBoundsFn section of documentation for more info
                        let thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                            pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
                        //     rect = thumbnail.getBoundingClientRect();
                        // return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
                          //  rect = thumbnail.getBoundingClientRect();
                        return {x: 10, y: 10 + pageYScroll, w: 10};
                    }
                };
                // PhotoSwipe opened from URL
                if (fromURL) {
                    if (options.galleryPIDs) {
                        // parse real index when custom PIDs are used
                        // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
                        for (let j = 0; j < items.length; j++) {
                            if (items[j].pid == index) {
                                options.index = j;
                                break;
                            }
                        }
                    } else {
                        // in URL indexes start from 1
                        options.index = parseInt(index, 10) - 1;
                    }
                } else {
                    options.index = parseInt(index, 10);
                }
                // exit if index not found
                if (isNaN(options.index)) {
                    return;
                }
                if (disableAnimation) {
                    options.showAnimationDuration = 0;
                }
                // Pass data to PhotoSwipe and initialize it
                gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, Object.assign(options, that.options));

                gallery.init();
                gallery.listen('destroy', function () {
                    let pswp = document.querySelectorAll('.pswp');
                    let iframe = document.querySelector('iframe.pswp__video');
                    pswp.forEach(item => {
                        item.classList.remove('pswp--open');
                    });
                    if (iframe) {
                        iframe.remove();
                    }

                });

                let pswp = document.querySelector('.js-pswp');

                gallery.listen('afterChange', () => {
                    let currentIndex = gallery.getCurrentIndex();

                    that.moveSlide(currentIndex,0)

                });

                gallery.listen('shareLinkClick', function () {
                });

                gallery.listen('destroy', function () {
                    let header = document.querySelector('.header');
                    //  let footer = document.querySelector('.footer');
                    // let incomingSlider = document.querySelector('.incoming-slider--product');
                   // header.classList.remove('is-media-opened');
                    // footer.classList.remove('is-media-opened');
                    // if (incomingSlider) {
                    //     incomingSlider.classList.remove('is-media-opened');
                    // }

                   // productSlider.allowTouchMove = true;

                });

                let closeBtn = pswp.querySelector('.pswp__button.pswp__button--close');

                closeBtn.addEventListener('click', ()=>{
                    gallery.close();

                })
            };
            // loop through all gallery elements and bind events
            let galleryElements = document.querySelectorAll(gallerySelector);
            for (let i = 0, l = galleryElements.length; i < l; i++) {
                galleryElements[i].setAttribute('data-pswp-uid', i + 1);
                galleryElements[i].onclick = onThumbnailsClick;
            }
            // Parse URL and open gallery if it contains #&pid=3&gid=1
            let hashData = photoswipeParseHash();
            if (hashData.pid && hashData.gid) {
                openPhotoSwipe(hashData.pid, galleryElements[hashData.gid - 1], true, true);
            }
        };
        initPhotoSwipeFromDOM('.my-galleryMain');
    }

}

export default Swiper;