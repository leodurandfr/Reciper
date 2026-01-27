<template>
  <div class="style-guide col-full">
    <header class="style-guide__header col-full">
      <h1 class="heading-01">Style Guide</h1>
      <p class="body-medium">Design System de RecettesScrapper</p>
    </header>

    <!-- COULEURS -->
    <section class="style-guide__section">
      <h2 class="heading-02">Couleurs</h2>

      <div class="color-group">
        <h3 class="heading-03">Brand</h3>
        <div class="color-swatches">
          <div class="color-swatch">
            <div class="color-swatch__preview" style="background: var(--color-brand)"></div>
            <div class="color-swatch__info">
              <span class="color-swatch__name">Brand</span>
              <code class="color-swatch__var">--color-brand</code>
              <span class="color-swatch__value">#FF5500</span>
            </div>
          </div>
          <div class="color-swatch">
            <div class="color-swatch__preview" style="background: var(--color-brand-hover)"></div>
            <div class="color-swatch__info">
              <span class="color-swatch__name">Brand Hover</span>
              <code class="color-swatch__var">--color-brand-hover</code>
              <span class="color-swatch__value">#e55a24</span>
            </div>
          </div>
        </div>
      </div>

      <div class="color-group">
        <h3 class="heading-03">Texte</h3>
        <div class="color-swatches">
          <div class="color-swatch">
            <div class="color-swatch__preview" style="background: var(--color-text)"></div>
            <div class="color-swatch__info">
              <span class="color-swatch__name">Text</span>
              <code class="color-swatch__var">--color-text</code>
              <span class="color-swatch__value">#2E2B25</span>
            </div>
          </div>
          <div class="color-swatch">
            <div class="color-swatch__preview" style="background: var(--color-text-50)"></div>
            <div class="color-swatch__info">
              <span class="color-swatch__name">Text 50%</span>
              <code class="color-swatch__var">--color-text-50</code>
              <span class="color-swatch__value">50% opacity</span>
            </div>
          </div>
        </div>
      </div>

      <div class="color-group">
        <h3 class="heading-03">Fonds</h3>
        <div class="color-swatches">
          <div class="color-swatch">
            <div class="color-swatch__preview color-swatch__preview--bordered" style="background: var(--color-background)"></div>
            <div class="color-swatch__info">
              <span class="color-swatch__name">Background</span>
              <code class="color-swatch__var">--color-background</code>
              <span class="color-swatch__value">#FBFAF8</span>
            </div>
          </div>
          <div class="color-swatch">
            <div class="color-swatch__preview" style="background: var(--color-background-strong)"></div>
            <div class="color-swatch__info">
              <span class="color-swatch__name">Background Strong</span>
              <code class="color-swatch__var">--color-background-strong</code>
              <span class="color-swatch__value">#F2EEE5</span>
            </div>
          </div>
          <div class="color-swatch">
            <div class="color-swatch__preview color-swatch__preview--bordered" style="background: var(--color-background-neutral)"></div>
            <div class="color-swatch__info">
              <span class="color-swatch__name">Background Neutral</span>
              <code class="color-swatch__var">--color-background-neutral</code>
              <span class="color-swatch__value">#ffffff</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TYPOGRAPHIE -->
    <section class="style-guide__section">
      <h2 class="heading-02">Typographie</h2>

      <div class="typography-group">
        <h3 class="heading-03">Polices</h3>
        <div class="font-families">
          <div class="font-family">
            <span class="font-family__sample" style="font-family: var(--font-family-heading)">Recoleta</span>
            <div class="font-family__info">
              <code>--font-family-heading</code>
              <span>Titres</span>
            </div>
          </div>
          <div class="font-family">
            <span class="font-family__sample" style="font-family: var(--font-family-body)">Neue Montreal</span>
            <div class="font-family__info">
              <code>--font-family-body</code>
              <span>Corps de texte</span>
            </div>
          </div>
        </div>
      </div>

      <div class="typography-group">
        <h3 class="heading-03">Styles de texte</h3>
        <p class="body-small type-scale__legend">Desktop / Tablet / Mobile</p>
        <div class="type-scale">
          <div class="type-scale__item">
            <span class="heading-01">Heading 01</span>
            <div class="type-scale__specs">
              <code>.heading-01</code>
              <span>44px / 38px / 32px</span>
            </div>
          </div>
          <div class="type-scale__item">
            <span class="heading-02">Heading 02</span>
            <div class="type-scale__specs">
              <code>.heading-02</code>
              <span>36px / 31px / 26px</span>
            </div>
          </div>
          <div class="type-scale__item">
            <span class="heading-03">Heading 03</span>
            <div class="type-scale__specs">
              <code>.heading-03</code>
              <span>28px / 25px / 22px</span>
            </div>
          </div>
          <div class="type-scale__item">
            <span class="body-medium">Body Medium</span>
            <div class="type-scale__specs">
              <code>.body-medium</code>
              <span>18px / 17px / 16px</span>
            </div>
          </div>
          <div class="type-scale__item">
            <span class="body-small">Body Small</span>
            <div class="type-scale__specs">
              <code>.body-small</code>
              <span>16px / 15px / 14px</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ESPACEMENT -->
    <section class="style-guide__section">
      <h2 class="heading-02">Espacement</h2>

      <div class="spacing-scale">
        <div v-for="space in spaces" :key="space.name" class="spacing-item">
          <div class="spacing-item__visual">
            <div class="spacing-item__bar" :style="{ width: space.value }"></div>
          </div>
          <div class="spacing-item__info">
            <code>{{ space.name }}</code>
            <span>{{ space.value }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- BORDER RADIUS -->
    <section class="style-guide__section">
      <h2 class="heading-02">Border Radius</h2>

      <div class="radius-scale">
        <div v-for="radius in radiuses" :key="radius.name" class="radius-item">
          <div class="radius-item__visual" :style="{ borderRadius: radius.value }"></div>
          <div class="radius-item__info">
            <code>{{ radius.name }}</code>
            <span>{{ radius.value }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- TRANSITIONS -->
    <section class="style-guide__section">
      <h2 class="heading-02">Transitions</h2>

      <div class="transitions-list">
        <div
          v-for="transition in transitions"
          :key="transition.name"
          class="transition-item"
          :style="{ '--transition': transition.value }"
        >
          <div class="transition-item__demo">
            <div class="transition-item__box"></div>
          </div>
          <div class="transition-item__info">
            <code>{{ transition.name }}</code>
            <span>{{ transition.value }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const spaces = [
  { name: '--space-01', value: '4px' },
  { name: '--space-02', value: '8px' },
  { name: '--space-03', value: '12px' },
  { name: '--space-04', value: '16px' },
  { name: '--space-05', value: '24px (16px tablet/mobile)' },
  { name: '--space-06', value: '32px (24px tablet/mobile)' },
  { name: '--space-07', value: '48px (32px tablet/mobile)' },
  { name: '--space-08', value: '64px (48px tablet/mobile)' },
  { name: '--space-09', value: '96px (64px tablet/mobile)' },
]

const radiuses = [
  { name: '--radius-01', value: '4px' },
  { name: '--radius-02', value: '8px' },
  { name: '--radius-03', value: '12px' },
  { name: '--radius-04', value: '16px' },
  { name: '--radius-05', value: '20px' },
  { name: '--radius-06', value: '24px' },
  { name: '--radius-07', value: '32px' },
  { name: '--radius-08', value: '40px' },
  { name: '--radius-full', value: '9999px' },
]

const transitions = [
  { name: '--transition-ultra-fast', value: '100ms ease' },
  { name: '--transition-fast', value: '150ms ease' },
  { name: '--transition-normal', value: '300ms ease' },
  { name: '--transition-slow', value: '500ms ease' },
  { name: '--transition-spring', value: '400ms cubic-bezier(0.34, 1.56, 0.64, 1)' },
  { name: '--transition-in-out', value: '400ms cubic-bezier(0.5, 0, 0.1, 1)' },
]
</script>

<style scoped>
.style-guide {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
  row-gap: var(--space-06);
}

.style-guide__header {
  grid-column: 1 / -1;
  margin-bottom: var(--space-04);
}

.style-guide__header p {
  color: var(--color-text-50);
  margin-top: var(--space-02);
}

.style-guide__section {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
  row-gap: var(--space-05);
}

.style-guide__section > h2 {
  grid-column: 1 / -1;
  padding-bottom: var(--space-03);
  border-bottom: 1px solid var(--color-background-strong);
}

/* Couleurs */
.color-group {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
  row-gap: var(--space-04);
}

.color-group h3 {
  grid-column: 1 / -1;
}

.color-swatches {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-04);
}

.color-swatch {
  background: var(--color-background-neutral);
  border-radius: var(--radius-03);
  overflow: hidden;
}

.color-swatch__preview {
  height: 80px;
}

.color-swatch__preview--bordered {
  border: 1px solid var(--color-background-strong);
  border-bottom: none;
}

.color-swatch__info {
  padding: var(--space-03);
  display: flex;
  flex-direction: column;
  gap: var(--space-01);
}

.color-swatch__name {
  font-weight: 600;
}

.color-swatch__var {
  font-size: var(--font-size-body-small);
  color: var(--color-brand);
  background: var(--color-background-strong);
  padding: var(--space-01) var(--space-02);
  border-radius: var(--radius-01);
  width: fit-content;
}

.color-swatch__value {
  font-size: var(--font-size-body-small);
  color: var(--color-text-50);
}

/* Typographie */
.typography-group {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
  row-gap: var(--space-04);
}

.typography-group h3 {
  grid-column: 1 / -1;
}

.font-families {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-04);
}

.font-family {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-04);
  background: var(--color-background-neutral);
  border-radius: var(--radius-03);
}

.font-family__sample {
  font-size: 28px;
}

.font-family__info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-01);
}

.font-family__info code {
  font-size: var(--font-size-body-small);
  color: var(--color-brand);
}

.font-family__info span {
  font-size: var(--font-size-body-small);
  color: var(--color-text-50);
}

.type-scale__legend {
  grid-column: 1 / -1;
  color: var(--color-text-50);
  margin-bottom: var(--space-02);
}

.type-scale {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: var(--space-03);
}

.type-scale__item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: var(--space-03) var(--space-04);
  background: var(--color-background-neutral);
  border-radius: var(--radius-03);
}

.type-scale__specs {
  display: flex;
  gap: var(--space-04);
  align-items: center;
}

.type-scale__specs code {
  font-size: var(--font-size-body-small);
  color: var(--color-brand);
}

.type-scale__specs span {
  font-size: var(--font-size-body-small);
  color: var(--color-text-50);
}

/* Espacement */
.spacing-scale {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-04);
}

.spacing-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-02);
  padding: var(--space-03);
  background: var(--color-background-neutral);
  border-radius: var(--radius-03);
}

.spacing-item__visual {
  width: 100%;
  height: 24px;
  background: var(--color-background-strong);
  border-radius: var(--radius-02);
  overflow: hidden;
}

.spacing-item__bar {
  height: 100%;
  background: var(--color-brand);
  border-radius: var(--radius-02);
}

.spacing-item__info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.spacing-item__info code {
  font-size: var(--font-size-body-small);
  color: var(--color-brand);
}

.spacing-item__info span {
  font-size: var(--font-size-body-small);
  color: var(--color-text-50);
}

/* Border Radius */
.radius-scale {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-04);
}

.radius-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-03);
}

.radius-item__visual {
  width: 80px;
  height: 80px;
  background: var(--color-brand);
}

.radius-item__info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-01);
}

.radius-item__info code {
  font-size: var(--font-size-body-small);
  color: var(--color-brand);
}

.radius-item__info span {
  font-size: var(--font-size-body-small);
  color: var(--color-text-50);
}

/* Transitions */
.transitions-list {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-04);
}

.transition-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-03);
  padding: var(--space-04);
  background: var(--color-background-neutral);
  border-radius: var(--radius-03);
}

.transition-item__demo {
  width: 100%;
  height: 40px;
  background: var(--color-background-strong);
  border-radius: var(--radius-02);
  padding: var(--space-02);
}

.transition-item__box {
  width: 24px;
  height: 24px;
  background: var(--color-brand);
  border-radius: var(--radius-02);
  transition: transform var(--transition);
}

.transition-item:hover .transition-item__box {
  transform: translateX(calc(100% - 24px));
}

.transition-item__info {
  display: flex;
  flex-direction: column;
  gap: var(--space-01);
}

.transition-item__info code {
  font-size: var(--font-size-body-small);
  color: var(--color-brand);
}

.transition-item__info span {
  font-size: var(--font-size-body-small);
  color: var(--color-text-50);
}

/* Tablet (lg: 768-1280px) */
@media (max-width: 1280px) {
  .color-swatches,
  .radius-scale {
    grid-template-columns: repeat(3, 1fr);
  }

  .spacing-scale {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile */
@media (max-width: 480px) {
  .color-swatches,
  .font-families,
  .spacing-scale,
  .radius-scale,
  .transitions-list {
    grid-template-columns: 1fr;
  }

  .type-scale__item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-02);
  }

  .font-family {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-03);
  }

  .font-family__info {
    align-items: flex-start;
  }
}
</style>
