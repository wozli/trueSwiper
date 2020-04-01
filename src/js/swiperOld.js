class Swiper {

    constructor(id, touchRation = 200, timeToSlide = 600, widthSlide = 300, margin = 20) {
        this.swiper = false;
        this.swiperWrapper = false;
        this.slides = [];
        this.pictures = [];
        this.swiperId = id;
        this.activeSlide = 0;
        this.countClick = 0;
        this.swaping = false;
        this.translateX = 0;
        this.widthSlide = widthSlide;
        this.imgOne = null;
        this.touchRation = touchRation;
        this.timeToSlide = timeToSlide;
        this.margin = margin
    }


    init() {
        this.swiper = document.querySelector(this.swiperId);
        if (this.swiper) {
            this.swiperWrapper = this.swiper.querySelector('.roninSwiper__wrapper');
            if (this.swiperWrapper) {
                this.swiperWrapper.addEventListener('click', e => this.clickWrapper());

                this.mouseDownWrapper();
                this.onResize();

                this.slides = this.swiperWrapper.querySelectorAll('.roninSwiper__slide');
                this.slides.forEach((slide, index) => {
                    if (this.margin) {
                        slide.style.marginRight = this.margin + 'px';
                    }
                    this.pictures.push({
                        sources: slide.querySelectorAll('SOURCE')
                    });
                    // запрет хватания картинок
                    // slide.querySelector('IMG').addEventListener('mousedown', e => e.preventDefault())
                });

                //получение первой картинки, что бы взять ширину
              //  this.imgOne = this.slides[0].querySelector('IMG');
                this.widthSlide = this.slides[0].offsetWidth;
                console.log(this.widthSlide );
//clientWidth
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
        }
    }

    // нажатие на свайпер
    mouseDownWrapper() {

        let vm = this;
        this.swiperWrapper.addEventListener('mousedown', mouseDown);
        this.swiperWrapper.addEventListener('touchstart', mouseDown);


        function mouseDown(e) {
            let startX = e.clientX;
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
                countStep = e.clientX - startX;

                vm.swiperWrapper.style.transform = `translateX(${countStep + +(transform[4] || vm.translateX)}px)`;
                vm.swiperWrapper.style.transitionDuration = '0ms';

                curTranslateX = e.clientX - startX + vm.translateX;
            }

            function mouseUp(e) {
                // endStart = Date.now();
                // let dateRation = (60 < endStart - dateStart) && (endStart - dateStart < vm.touchRation);
                //
                // vm.widthSlide = vm.slides[0].offsetWidth;

                document.removeEventListener('mousemove', mouseMove);
                document.removeEventListener('touchmove', mouseMove);
                document.removeEventListener('mouseup', mouseUp);
                document.removeEventListener('touchend', mouseUp);
                vm.translateX = curTranslateX;

                // let swapingSlide = Math.round(Math.abs(countStep) / vm.widthSlide);
                //
                // if (countStep < 0) {
                //
                //     if (dateRation) {
                //         vm.activeSlide = (vm.activeSlide + 1 > vm.slides.length - 1 ? vm.slides.length - 1 : vm.activeSlide + 1);
                //         actionSlide();
                //     }
                //
                //     if (swapingSlide > 0 && vm.activeSlide !== vm.slides.length - 1) {
                //         vm.activeSlide = (vm.activeSlide + swapingSlide > vm.slides.length - 1 ? vm.slides.length - 1 : vm.activeSlide + swapingSlide);
                //         actionSlide();
                //
                //     } else {
                //         actionSlide();
                //
                //     }
                //
                // } else if (countStep > 0) {
                //
                //     if (dateRation && vm.activeSlide !== 0) {
                //         vm.activeSlide--;
                //         actionSlide();
                //     }
                //
                //     if (swapingSlide > 0 && vm.activeSlide !== 0) {
                //         vm.activeSlide -= swapingSlide;
                //
                //     } else {
                //         actionSlide();
                //     }
                // } else {
                //     actionSlide();
                // }

                function actionSlide() {
                    vm.translateX = vm.activeSlide * vm.widthSlide * -1;
                    vm.swiperWrapper.style.transitionDuration = `${vm.timeToSlide}ms`;
                    vm.swiperWrapper.style.transform = `translateX(${vm.translateX - (vm.margin * vm.activeSlide)}px)`;

                }
            }
        }


    }

    //клик по свайперу, для увеличения картинок
    clickWrapper() {
        let mq = window.matchMedia("(max-width: 420px)").matches;

        if (this.countClick < 2 && !this.swaping && mq) {
            this.countClick++;
            this.pictures.forEach((picture, index) => {
                picture.sources[picture.sources.length - 1].setAttribute('srcset', picture.sources[picture.sources.length - 1 - this.countClick].getAttribute('srcset'))
            });
            this.widthSlide = this.slides[0].offsetWidth;
        } else {
            this.swaping = false;
        }

    }
}

export default Swiper;