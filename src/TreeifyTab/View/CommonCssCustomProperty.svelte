<style global lang="scss">
  :root {
    --bullet-size: 0.375em;
    --bullet-color: lch(60% 0 0);
    --bullet-hover-color: lch(40% 0 0);
    --bullet-outer-circle-color: lch(90% 0 0);
    --bullet-outer-circle-hover-color: lch(80% 0 0);

    --bullet-outer-circle-min-size-em: 1.05;
    --bullet-outer-circle-max-size-em: 1.25;
    // 外側の円が最大サイズになる子項目数
    --bullet-outer-circle-child-count-limit: 10;
    // 外側の円が最大サイズになる子孫項目数
    --bullet-outer-circle-item-count-limit: 20;

    --page-icon-color: lch(30% 0 0);
    --page-icon-hover-color: lch(20% 0 0);

    // トランスクルードされた項目のバレットの色
    --transcluded-item-bullet-color: lch(60% 40 160.4);
    // トランスクルードされた項目のバレットのマウスホバー時の色
    --transcluded-item-bullet-hover-color: lch(40% 40 160.4);

    // ハイライト状態の項目のバレットの色。彩度は色域境界値
    --highlighted-item-bullet-color: lch(50% 98.7 40.4);
    // ハイライト状態の項目のバレットのマウスホバー時の色。彩度は色域境界値
    --highlighted-item-bullet-hover-color: lch(40% 83.7 40.4);

    --indent-guide-color: lch(90% 0 0);
    --indent-guide-hover-color: lch(80% 0 0);

    // 彩度は色域境界値
    --selected-item-background-color: lch(95% 7.8 280.4);
    // 彩度は色域境界値
    --item-hover-background-color: lch(98% 3.1 280.4);

    // 最も新しい足跡の色（線形補間の一端）。彩度は色域境界値
    --newest-footprint-color: lch(97.5% 3.5 40.4);
    // 最も古い足跡の色（線形補間の一端）
    --oldest-footprint-color: lch(100% 0 0);

    --circle-button-hover-color: lch(93% 0 0);

    --menu-item-hover-background-color: lch(94% 0 0);

    --completed-item-text-color: lch(75% 0 0);

    // 彩度は色域境界値
    --doubtful-item-decoration-color: lch(60% 82.6 40.4);
    --doubtful-item-decoration: underline dashed var(--doubtful-item-decoration-color);
    --doubtful-item-decoration-thickness: 1px;
    --doubtful-item-decoration-underline-offset: 0.2em;

    // 彩度は色域境界値
    --unread-web-page-item-title-color: lch(35% 35.4 160.4);
  }
</style>
