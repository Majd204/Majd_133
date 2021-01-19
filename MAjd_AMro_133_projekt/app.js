const hproduct = document.querySelector(".products");
const hkorb = document.querySelector(".korb");
const korbContent = document.querySelector(".korblist");
const korbopen = document.querySelector(".minikorb");
const korbclose = document.querySelector(".closekorb");
const overlay = document.querySelector(".korboverlay");
const korbTotal = document.querySelector(".korbtotal");
const korbTotal2 = hkorb.querySelector(".korbtotal");
const korbclear = document.querySelector(".clearkorb");
let korb = [];
let buttonDOM = [];

class Shop {
  displayProducts(products) {
    let results = "";
    products.forEach(({ productName, normalPrice, imageName, id }) => {
      results += `
      <div class="product">
        <div>
          <img src=${imageName} alt="" />
        </div>
        <div class="productname">
          <h1>${productName}</h1>
         <br>    
          <div class="bottom">
            <div class="btngroup">
              <button class="btn addTokorb" data-id= ${id} >Auf Korb einfügen</button>
            </div>
            <div class="price">CHF ${normalPrice}</div>
          </div>
        </div>
      </div>
     `;
    });

    hproduct.innerHTML = results;
  }

  getButtons() {
    const buttons = [...document.querySelectorAll(".addTokorb")];
    buttonDOM = buttons;
    buttons.forEach(button => {
      const id = button.dataset.id;
      const inKorb = korb.find(item => item.id === parseInt(id, 10));

      button.addEventListener("click", e => {
        e.preventDefault();
        const korbItem = { ...Storage.getProduct(id), amount: 1 };
        korb = [...korb, korbItem];
        Storage.savekorb(korb);
        this.setItemValues(korb);
        this.addkorbItem(korbItem);
      });
    });
  }

  setItemValues(korb) {
    let tempTotal = 0;

    korb.map(item => {
      tempTotal += item.normalPrice * item.amount;
    });
    korbTotal.innerText = parseFloat(tempTotal.toFixed(2));
    korbTotal2.innerText = parseFloat(tempTotal.toFixed(2));
  }

  addkorbItem({ imageName, normalPrice, productName, id }) {
    const div = document.createElement("div");
    div.classList.add("korbitem");

    div.innerHTML = 
    `
          <div>
            <h3>${productName}</h3>
            <h3 class="price">   CHF ${normalPrice}</h3>
          </div>
          <div>
            <span class="increase" data-id=${id}>
             +
            </span>
            <p class="itemamount">1</p>
            <span class="decrease" data-id=${id}>
             -
            </span>
          </div>

            <span class="removeitem" data-id=${id}>
              delete 
            </span>

        </div>`;
    korbContent.appendChild(div);
  }
 
 
  hide() {
    hkorb.classList.remove("show");
  }
 
  show() {
    hkorb.classList.add("show");
  }
  

  pop() {
    korb = Storage.getkorb();
    this.setItemValues(korb);
    this.addthis(korb);

    korbopen.addEventListener("click", this.show);
    korbclose.addEventListener("click", this.hide);
  }

  addthis(korb) {
    korb.forEach(item => this.addkorbItem(item));
  }

  korbLogic() {
    korbclear.addEventListener("click", () => {
      this.clearkorb();
      this.hide();
    });
  

      korbContent.addEventListener("click", e => {
      const target = e.target.closest("span");
      const targetElement = target.classList.contains("removeitem");
      if (!target) return;

      if (targetElement) 
      {
        const id = parseInt(target.dataset.id);
        this.removeItem(id);
        korbContent.removeChild(target.parentElement);
      } 
      else if (target.classList.contains("increase")) 
      {
        const id = parseInt(target.dataset.id, 10);
        let tempItem = korb.find(item => item.id === id);
        tempItem.amount++;
        Storage.savekorb(korb);
        this.setItemValues(korb);
        target.nextElementSibling.innerText = tempItem.amount;
      } 
      
      else if (target.classList.contains("decrease"))
       {
        const id = parseInt(target.dataset.id, 10);
        let tempItem = korb.find(item => item.id === id);
        tempItem.amount--;

        if (tempItem.amount > 0)
         {
          Storage.savekorb(korb);
          this.setItemValues(korb);
          target.previousElementSibling.innerText = tempItem.amount;
        } 
        else
         {
          this.removeItem(id);
          korbContent.removeChild(target.parentElement.parentElement);
        }
      }
    });
  }
 
  removeItem(id) {
    korb = korb.filter(item => item.id !== id);
    this.setItemValues(korb);
    Storage.savekorb(korb);

    let button = this.singleButton(id);
    button.disabled = false;
    button.innerText = "addTokorb";
  }

  
  clearkorb() {
    const korbItems = korb.map(item => item.id);
    korbItems.forEach(id => this.removeItem(id));

    while (korbContent.children.length > 0) {
      korbContent.removeChild(korbContent.children[0]);
    }
  }

  

  singleButton(id) {
    return buttonDOM.find(button => parseInt(button.dataset.id) === id);
  }
}
class Storage {
  static saveProduct(obj) {
    localStorage.setItem("products", JSON.stringify(obj));
  }

  static savekorb(korb) {
    localStorage.setItem("korb", JSON.stringify(korb));
  }

  static getProduct(id) {
    const products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === parseFloat(id, 10));
  }

  static getkorb() {
    return localStorage.getItem("korb")
      ? JSON.parse(localStorage.getItem("korb"))
      : [];
  }
}

class producte {
  async getProducts() {
    try {
      const result = await fetch("products.json");
      const data = await result.json();
      const products = data.items;
      return products;
    } catch (err) {
      console.log(err);
    }
  }
}



document.addEventListener("DOMContentLoaded", async () => {
  const productlist = new producte();
  const shop = new Shop();

  shop.pop();

  const products = await productlist.getProducts();
  shop.displayProducts(products);
  Storage.saveProduct(products);
  shop.getButtons();
  shop.korbLogic();
});

//open picture, move "add to cart" to 
//Warenkorb +- change to left and right instead of up and down
//if click "add to cart" then let it not duplicate in warenkorb instead put a +1
