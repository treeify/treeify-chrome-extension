<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    --bullet-size: #{common.toIntegerPx(0.375em)};
    --bullet-color: oklch(60% 0 0);
    --bullet-hover-color: oklch(40% 0 0);
    --bullet-outer-circle-color: oklch(90% 0 0);
    --bullet-outer-circle-hover-color: oklch(80% 0 0);

    --bullet-outer-circle-min-size-em: 1.05;
    --bullet-outer-circle-max-size-em: 1.25;
    // 外側の円が最大サイズになる子項目数
    --bullet-outer-circle-child-count-limit: 10;
    // 外側の円が最大サイズになる子孫項目数
    --bullet-outer-circle-item-count-limit: 20;

    --page-icon-color: oklch(30% 0 0);
    --page-icon-hover-color: oklch(20% 0 0);

    --transcluded-item-bullet-color: oklch(60% 1 135.4);
    --transcluded-item-bullet-hover-color: oklch(50% 1 135.4);
    --transcluded-item-page-icon-color: oklch(50% 1 135.4);
    --transcluded-item-page-icon-hover-color: oklch(40% 1 135.4);

    --highlighted-item-bullet-color: oklch(52% 1 15.4);
    --highlighted-item-bullet-hover-color: oklch(42% 1 15.4);

    --indent-guide-color: oklch(92% 0 0);
    --indent-guide-hover-color: oklch(84% 0 0);

    --selected-item-background-color: oklch(96% 1 255.4);
    --item-hover-background-color: oklch(98% 1 255.4);

    // 最も新しい足跡の色（線形補間の一端）
    --newest-footprint-color: oklch(98.5% 1 15.4);
    // 最も古い足跡の色（線形補間の一端）
    --oldest-footprint-color: oklch(100% 0 0);

    --circle-button-hover-color: oklch(93% 0 0);

    --menu-item-hover-background-color: oklch(94% 0 0);

    --completed-item-text-color: oklch(75% 0 0);

    --doubtful-item-decoration-color: oklch(60% 1 15.4);
    --doubtful-item-decoration: underline dashed var(--doubtful-item-decoration-color);
    --doubtful-item-decoration-thickness: 1px;
    --doubtful-item-decoration-underline-offset: #{common.toIntegerPx(0.2em)};

    --discarded-web-page-item-title-color: oklch(40% 0 0);
    --tab-closed-web-page-item-title-color: oklch(60% 0 0);

    --unread-web-page-item-title-color: oklch(45% 1 135.4);
    --unread-discarded-web-page-item-title-color: oklch(52% 0.16 135.4);
    --unread-tab-closed-web-page-item-title-color: oklch(60% 0.1 135.4);
    --unread-completed-web-page-item-title-color: oklch(75% 0.05 135.4);

    // Chromeのplaceholderのデフォルトの色はoklch(56.2% 0 0)相当だが、
    // 初期値なのかプレースホルダーなのか見分けづらいのでもっと薄い色にした。
    --placeholder-text-color: oklch(70% 0 0);
  }
</style>
