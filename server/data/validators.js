export default {
  channelName: function (value) {
    const pattern = /^[a-z\-\d]+$/;

    return (
      (this.type === 0 && pattern.test(value)) || this.type !== 0 || !value
    );
  },
  username: (value) => {
    const pattern =
      /^(?!.*everyone|.*here|.*Elysium|.*elysium).*[A-Za-z][^ .?!@:#`][A-Za-z0-9_]$/;
    return pattern.test(value) || !value;
  },
  unchangeableWithProp: (prop, value) => (val) => {
    return this[prop] !== value || !val;
  },
};
