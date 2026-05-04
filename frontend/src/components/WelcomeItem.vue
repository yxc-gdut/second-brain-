<template>
  <div class="item">
    <i>
      <slot name="icon"></slot>
    </i>
    <div class="details">
      <h3>
        <slot name="heading"></slot>
      </h3>
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.item {
  margin-top: 16px;
  display: flex;
  position: relative;
}

.details {
  flex: 1;
  margin-left: 12px;
}

i {
  display: flex;
  place-items: center;
  place-content: center;
  width: 32px;
  height: 32px;
  color: var(--kd-color-icon-primary, #333333);
}

h3 {
  font-size: var(--kd-font-size-middle, 16px);
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--kd-color-text-primary, #0D0D0D);
}

@media (min-width: 1024px) {
  .item {
    margin-top: 0;
    padding: 4px 0 12px calc(24px / 2);
  }

  i {
    top: calc(50% - 25px);
    left: -26px;
    position: absolute;
    border: 1px solid var(--kd-color-line-light, rgba(13,13,13,0.06));
    background: var(--kd-color-fill-base, #FFFFFF);
    border-radius: var(--kd-radius-lg, 8px);
    width: 50px;
    height: 50px;
  }

  .item:before {
    content: ' ';
    border-left: 1px solid var(--kd-color-line-light, rgba(13,13,13,0.06));
    position: absolute;
    left: 0;
    bottom: calc(50% + 25px);
    height: calc(50% - 25px);
  }

  .item:after {
    content: ' ';
    border-left: 1px solid var(--kd-color-line-light, rgba(13,13,13,0.06));
    position: absolute;
    left: 0;
    top: calc(50% + 25px);
    height: calc(50% - 25px);
  }

  .item:first-of-type:before {
    display: none;
  }

  .item:last-of-type:after {
    display: none;
  }
}
</style>
