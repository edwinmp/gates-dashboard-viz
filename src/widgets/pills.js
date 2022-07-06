const createPill = (pillParent, pill) => {
  // create pill list item
  const pillElement = document.createElement('li');
  pillElement.classList.add('m-pills__item');
  pillElement.innerHTML = pill;
  pillParent.appendChild(pillElement);
  // create and add remove button
  const removeButton = document.createElement('button');
  removeButton.setAttribute('type', 'button');
  pillElement.appendChild(removeButton);
  // create button icon
  const icon = document.createElement('i');
  icon.setAttribute('role', 'presentation');
  icon.classList.add(...['ico', 'ico--20', 'ico-cross-slate']);
  removeButton.appendChild(icon);

  return [pillElement, removeButton];
};
const createWidget = () => {
  const widgetWrapper = document.createElement('div');
  widgetWrapper.classList.add('spotlight-banner');

  return widgetWrapper;
};

function PillWidget(options) {
  const widget = {
    pillNames: options.pills || [],
    onAddListener: options.onAdd,
    onRemoveListener: options.onRemove,
    widget: null,
    pills: [],
    init() {
      this.widget = createWidget();
      if (this.pillNames && this.pillNames.length) {
        this.pillNames.forEach((pillName) => this.add(pillName, true));
      }
    },
    add(pillName, allowDuplicate = false) {
      if (!allowDuplicate && this.pillNames.includes(pillName)) return;
      this.pillNames.push(pillName);
      // create pill button
      const [pill, button] = createPill(this.widget, pillName);
      this.pills.push(pill);
      button.addEventListener('click', (event) => {
        const parent = event.currentTarget.parentElement;
        if (parent) {
          this.remove(parent.innerText);
        }
      });
      if (this.onAddListener) {
        this.onAddListener(pillName);
      }
    },
    remove(pillName) {
      const index = this.pillNames.indexOf(pillName);
      this.pillNames = this.pillNames.filter((p) => p !== pillName);
      const pill = this.pills[index];
      this.pills = this.pills.filter((p, _index) => _index !== index);
      pill.remove();
      if (this.onRemoveListener) {
        this.onRemoveListener(pillName);
      }
    },
    onAdd(onAddListener) {
      this.onAddListener = onAddListener;
    },
    onRemove(onRemoveListener) {
      this.onRemoveListener = onRemoveListener;
    },
    removeAll() {
      this.pillNames = [];
      this.pills.forEach((button) => button.remove());
      this.pill = [];
    },
  };
  widget.init();

  return widget;
}

export default PillWidget;
