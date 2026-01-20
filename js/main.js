$(()=>{
    const $reveal = $(".reveal");
    const delayStepMs = 140;

    $reveal.each((index)=>{
        const delay = Math.min(index * delayStepMs, 700);
        $(this).css("transition-delay", `${delay}ms`);
    });

    const revealOnScroll = () => {
        const windowBottom = $(window).scrollTop() + $(window).height() * 0.85;
        $reveal.each(function () {
            const $el = $(this);
            if ($el.offset().top < windowBottom) {
                $el.addClass("is-visible");
            }
        });
    };

    revealOnScroll();
    $(window).on("scroll", revealOnScroll);

    $(".site-nav a, .btn, .site-footer a").on("click", function (event) {
        const target = $(this).attr("href");
        if (target && target.startsWith("#")) {
            const $target = $(target);
            if ($target.length) {
                event.preventDefault();
                $("html, body").animate(
                    { scrollTop: $target.offset().top - 16 },
                    650
                );
            }
        }
    });

    if ("serviceWorker" in navigator) {
        $(window).on("load", function () {
            navigator.serviceWorker.register("./sw.js").catch(function () {});
        });
    }
});
