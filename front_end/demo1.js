function createcounter() {
    let count = 0;

    return{
        increment: function() {
            count++;
        },
        decrement: function() {
            count--;
        },
        getvalue: function() {
            return count;
        }

    };
            
}

const counter = createcounter();
counter.increment();
counter.increment();
counter.increment();
console.log(counter.getvalue());

counter.decrement();
console.log(counter.getvalue());