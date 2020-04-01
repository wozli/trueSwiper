import Swiper from './Swiper';

const swiper = new Swiper({
    pagination: true,
    btnPrevNext: true,
    margin: 30,
    // дефолтные значения
   // id: '#swiper-js', - ид свайпера
    // touchRation: 200, - врем на реагирования для быстрых свайпов в мс
    // timeToSlide: 600,  - переход между слайдами в мс
    // timeChangeImg: 300,  - хадержка изменения размеров картинки в мс
    // margin: 0,  - марджин между слайдами в рх, через стили не задавать
    // pagination: false, - нужна ли пагинация
    // btnPrevNext: false, - нужны ли кнопки переходов
    // activeSlide: 1 - начальный слайд
});
swiper.init();