export let totalPrice = 0

export let calcPrice = (cartExist) => {
  for (const item of cartExist.products) {

    totalPrice += (item.price * item.quantity)
  }
}