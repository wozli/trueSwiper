//RoninSwiper - свайпер свободного движения и подмены 1 source остальными для увеличения
//v: 1.0.0
class Swiper2 {

    constructor(id, touchRation = 250, timeToSlide = 600, widthSlide = 300, margin = 20) {
        this.swiper = false;
        this.swiperWrapper = false;
        this.slides = [];
        this.pictures = [];
        this.swiperId = id;
        this.activeSlide = 0;
        this.swaping = false;
        this.translateX = 0;
        this.widthSlide = widthSlide;
        this.widthWrapp = 0;
        this.imgOne = null;
        this.touchRation = touchRation;
        this.timeToSlide = timeToSlide;
        this.margin = margin;
        this.zoomBtnInc = false;
        this.zoomBtnDec = false;
        this.zoomX = 0;
    }


    init() {
        this.swiper = document.querySelector(this.swiperId);
        if (this.swiper) {
            this.swiperWrapper = this.swiper.querySelector('.roninSwiper__wrapper');
            //функция зума
            this.zoomImg();

            if (this.swiperWrapper) {
                // this.swiperWrapper.addEventListener('click', e => this.clickWrapper());

                this.mouseDownWrapper();
                this.onResize();

                this.slides = this.swiperWrapper.querySelectorAll('.roninSwiper__slide');
                this.slides.forEach((slide, index) => {
                    if (this.margin) {
                        slide.style.marginRight = this.margin + 'px';
                    }
                    this.widthWrapp += (index + 1 < this.slides.length ? slide.offsetWidth + this.margin : 0);

                    this.pictures.push({
                        sources: slide.querySelectorAll('SOURCE')
                    });
                    // запрет хватания картинок
                    // slide.querySelector('IMG').addEventListener('mousedown', e => e.preventDefault())
                });

                //получение первой картинки, что бы взять ширину
                //  this.imgOne = this.slides[0].querySelector('IMG');
                this.widthSlide = this.slides[0].offsetWidth;


            }
        }

    }

    onResize() {
        let vm = this;
        window.addEventListener('resize', onResize);
        let startDocWidth = document.documentElement.clientWidth;

        function onResize(e) {

            vm.swiperWrapper.style.transitionDuration = '0ms';
            vm.widthSlide = vm.slides[0].offsetWidth;
            vm.translateX = vm.activeSlide * vm.widthSlide * -1;
            vm.swiperWrapper.style.transform = `translateX(${vm.translateX - (vm.margin * vm.activeSlide)}px)`;
            vm.widthWrapp = 0;
            vm.slides.forEach((slide, index) => {
                vm.widthWrapp += (index + 1 < vm.slides.length ? slide.offsetWidth + vm.margin : 0);
            });
        }
    }

    // нажатие на свайпер
    mouseDownWrapper() {

        let vm = this;
        this.swiperWrapper.addEventListener('mousedown', mouseDown);
        this.swiperWrapper.addEventListener('touchstart', mouseDown);


        function mouseDown(e) {
            let startX = e.clientX || e.targetTouches[0].clientX;
            let curTranslateX = vm.translateX;
            let countStep = 0;
            let dateStart = Date.now();
            let endStart = 0;

            document.addEventListener('mousemove', mouseMove);
            document.addEventListener('touchmove', mouseMove);
            document.addEventListener('mouseup', mouseUp);
            document.addEventListener('touchend', mouseUp);

            let transform = getComputedStyle(vm.swiperWrapper).transform.split(',');

            if (transform[4]) {
                vm.swiperWrapper.style.transform = `translateX(${transform[4]}px)`;
                vm.swiperWrapper.style.transitionDuration = '0ms';
            }

            function mouseMove(e) {
                vm.swaping = true;
                let clientX = e.clientX || e.targetTouches[0].clientX;
                countStep = clientX - startX;

                vm.swiperWrapper.style.transform = `translateX(${countStep + +(transform[4] || vm.translateX)}px)`;
                vm.swiperWrapper.style.transitionDuration = '0ms';

                curTranslateX = clientX - startX + vm.translateX;
            }

            function mouseUp(e) {
                endStart = Date.now();
                //разница времени нажатия и поднятия кнопки мыши - был ли быстрый свайп
                let dateRation = endStart - dateStart;
                let timer = false;


                //если был
                if (dateRation < vm.touchRation) {

                    //находим начальный коэфицент смещения слайдов в зависимости от зума для быстрых свайпов
                    let distanceGenerationBig = 2;
                    let distanceGenerationSmall = 1;

                    switch (vm.zoomX) {
                        case 1:
                            distanceGenerationBig = 4;
                            distanceGenerationSmall = 2;
                            break;
                        case 2:
                            distanceGenerationBig = 6;
                            distanceGenerationSmall = 4;
                            break;
                    }

                    // задаем время и смещение для быстро свайпа
                    let transform = getComputedStyle(vm.swiperWrapper).transform.split(',')[4] || 0;
                    let timeDuration = (dateRation >= 150 ? dateRation * 3 : dateRation * 2);
                    let distance = (dateRation >= 150 ? dateRation * distanceGenerationBig : dateRation * distanceGenerationSmall);

                    //дистанция больше до конца и края
                    console.log(+(transform || curTranslateX) + (distance * -1), vm.widthWrapp * -1);
                    if (+(transform || curTranslateX) + (distance * -1)  < vm.widthWrapp * -1) {
                        distance = vm.widthWrapp;
                        console.log(1);
                    } else if (+(transform || curTranslateX) + distance > 0) {
                        distance = 0;
                        console.log(2);
                    } else {
                        distance += +(transform || curTranslateX) * -1;
                        console.log(3);
                        console.log(distance);
                    }

                    //определяем в какую сторону и смещаем
                    if (countStep < 0 && Math.abs(+transform) < (vm.widthWrapp - +vm.widthSlide)) {
                        vm.swiperWrapper.style.transitionDuration = `${timeDuration}ms`;
                        vm.swiperWrapper.style.transform = `translateX(${distance * -1}px)`;

                    } else if (countStep > 0 && +transform < 0) {
                        vm.swiperWrapper.style.transitionDuration = `${timeDuration}ms`;
                        vm.swiperWrapper.style.transform = `translateX(${distance}px)`;

                    } else {
                        timeDuration = 0;
                    }
                    clearTimeout(timer);
                    timer = outBorder(timeDuration, countStep);

                } else {
                    clearTimeout(timer);
                    timer = outBorder(0, countStep);
                }

                // vm.widthSlide = vm.slides[0].offsetWidth;

                document.removeEventListener('mousemove', mouseMove);
                document.removeEventListener('touchmove', mouseMove);
                document.removeEventListener('mouseup', mouseUp);
                document.removeEventListener('touchend', mouseUp);
                vm.translateX = curTranslateX;
            }

            //функция вышли ли слайды за границу
            function outBorder(time, countStep) {
                return setTimeout(() => {

                   let transform = getComputedStyle(vm.swiperWrapper).transform.split(',');
                    if (countStep > 0 && +transform[4] > 0) {
                        vm.swiperWrapper.style.transform = `translateX(0px)`;
                    } else if (countStep < 0 && Math.abs(+transform[4]) > vm.widthWrapp) {
                        vm.swiperWrapper.style.transform = `translateX(-${vm.widthWrapp}px)`;
                    }
                    vm.swiperWrapper.style.transitionDuration = `${vm.timeToSlide}ms`;

                }, time + 10);
            }
        }


    }

    zoomImg() {
        let vm = this;
        this.zoomBtnInc = this.swiper.querySelector('#inc');
        this.zoomBtnDec = this.swiper.querySelector('#dec');

        this.zoomBtnInc.addEventListener('click', e => {
            changeSource('inc');
        });

        this.zoomBtnDec.addEventListener('click', e => {
            changeSource('dec');
        });

        this.zoomBtnInc.addEventListener('mousedown', e => {
            this.zoomBtnInc.classList.add('is-active');
        });
        this.zoomBtnInc.addEventListener('mouseup', e => {
            this.zoomBtnInc.classList.remove('is-active');

        });
        this.zoomBtnDec.addEventListener('mousedown', e => {
            this.zoomBtnDec.classList.add('is-active');
        });
        this.zoomBtnDec.addEventListener('mouseup', e => {
            this.zoomBtnDec.classList.remove('is-active');
        });
        let timer = false;

        function changeSource(type) {
            let emptySource = true;
            switch (type) {
                case 'inc':
                    if (vm.zoomX + 1 > 2) {
                        emptySource = false;
                    } else {
                        vm.zoomX++;
                    }

                    break;

                case 'dec':
                    if (vm.zoomX - 1 >= 0) {
                        vm.zoomX--;

                    } else {
                        emptySource = false;
                    }
                    break;
            }
            //если зум в пределах  0 - 2 меняем сурсы
            if (emptySource) {
                let transform = +getComputedStyle(vm.swiperWrapper).transform.split(',')[4] || 0;
                let curSlide = null;
                let widthAmount = 0;
                let arrWidthSlide = [];
                vm.slides.forEach((slide, index)=> {
                    widthAmount += slide.offsetWidth + vm.margin;
                    arrWidthSlide.push(slide.offsetWidth);

                    if (Math.abs(+transform) < widthAmount && curSlide === null) {
                        curSlide = index;
                    }
                });

                vm.pictures.forEach((picture, index) => {
                    if (picture.sources[vm.zoomX]) {
                        picture.sources[0].srcset = picture.sources[vm.zoomX].dataset.srcset;
                    }
                });

                clearTimeout(timer);
                let differencyWidthSlide = 0;
                timer = setTimeout(() => {
                    vm.widthSlide = vm.slides[0].offsetWidth;
                    vm.widthWrapp = 0;
                    vm.slides.forEach((slide, index) => {

                            vm.widthWrapp += (index + 1 !== vm.slides.length ? slide.offsetWidth + vm.margin : 0);

                        if (curSlide > index ) {
                            differencyWidthSlide += Math.abs(arrWidthSlide[index] - (slide.offsetWidth));
                        }
                    });

                    if (transform !== 0) {
                        let position = +transform + (type === 'inc'  ? differencyWidthSlide*-1 : differencyWidthSlide);
                        if (position > 0) {
                            position = 0;
                        }
                        else if (position*-1 > vm.widthWrapp ) {
                            position = vm.widthWrapp * -1
                        }

                        vm.swiperWrapper.style.transform = `translateX(${position}px)`;
                        vm.swiperWrapper.style.transitionDuration = `${vm.timeToSlide}ms`;
                    }

                }, 100);





            }


        }
    }

    //клик по свайперу, для увеличения картинок
    // clickWrapper() {
    //     let mq = window.matchMedia("(max-width: 420px)").matches;
    //
    //     if (this.countClick < 2 && !this.swaping && mq) {
    //         this.countClick++;
    //         this.pictures.forEach((picture, index) => {
    //             picture.sources[picture.sources.length - 1].setAttribute('srcset', picture.sources[picture.sources.length - 1 - this.countClick].getAttribute('srcset'))
    //         });
    //         this.widthSlide = this.slides[0].offsetWidth;
    //         this.widthWrapp = 0;
    //         this.slides.forEach((slide, index) => {
    //             this.widthWrapp += (index + 1 < this.slides.length ? slide.offsetWidth + this.margin : 0);
    //         });
    //
    //     } else {
    //         this.swaping = false;
    //     }
    // }
}

export default Swiper2;