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

    --transcluded-item-bullet-color: oklch(60% 40 135);
    --transcluded-item-bullet-hover-color: oklch(40% 40 135);
    --transcluded-item-page-icon-color: oklch(60% 40 135);
    --transcluded-item-page-icon-hover-color: oklch(40% 40 135);

    // ハイライト状態の項目のバレットの色。彩度は色域境界値
    --highlighted-item-bullet-color: oklch(50% 98.7 15);
    // ハイライト状態の項目のバレットのマウスホバー時の色。彩度は色域境界値
    --highlighted-item-bullet-hover-color: oklch(40% 83.7 15);

    --indent-guide-color: oklch(90% 0 0);
    --indent-guide-hover-color: oklch(80% 0 0);

    // 彩度は色域境界値
    --selected-item-background-color: oklch(95% 7.8 255);
    // 彩度は色域境界値
    --item-hover-background-color: oklch(98% 3.1 255);

    // 最も新しい足跡の色（線形補間の一端）。彩度は色域境界値
    --newest-footprint-color: oklch(97.5% 3.5 15);
    // 最も古い足跡の色（線形補間の一端）
    --oldest-footprint-color: oklch(100% 0 0);

    --circle-button-hover-color: oklch(93% 0 0);

    --menu-item-hover-background-color: oklch(94% 0 0);

    --completed-item-text-color: oklch(75% 0 0);

    // 彩度は色域境界値
    --doubtful-item-decoration-color: oklch(60% 82.6 15);
    --doubtful-item-decoration: underline dashed var(--doubtful-item-decoration-color);
    --doubtful-item-decoration-thickness: 1px;
    --doubtful-item-decoration-underline-offset: #{common.toIntegerPx(0.2em)};

    // 彩度は色域境界値
    --unread-web-page-item-title-color: oklch(35% 35.4 135);
  }
</style>
