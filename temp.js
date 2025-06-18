 class Animal {
  constructor(name) {
    this.name = name;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); 
    this.breed = breed;
  }
}

let husky = new Dog("husk","ram")
console.log(husky.name)