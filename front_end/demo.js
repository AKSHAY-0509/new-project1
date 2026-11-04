function createcounter() {
    let count = 0;

    return function() {
        count++;
        console.log(count);
    };

}

const counter = createcounter();

counter(); 
counter(); 
counter();