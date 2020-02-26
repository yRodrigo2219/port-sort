const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('sel-sort');
const xpeed = document.getElementById('xpeed');

const array = [];

var iPS = 5; // default iterations per second
xpeed.innerHTML = " " + iPS + "x";
var timer;
var width = canvas.width;
var height = canvas.height;
var sleep;
var playT = false; // flag 
var srtg = false; // flag
var force = false; // flag

const sort = { // enum
    MERGE : "1",
    HEAP : "2",
    BUBBLE : "3",
    SELECT : "4",
}

const aux = {
    w : 0, // width of each element
    h : 8.3, // height multiplier
    r : max => Math.floor( Math.random() * (max+1) ), // range(0..max)
    s : "#1fd0ff", // select color
    f : "#1f00ff", // fixed color
    n : "#1f60ff", // natural color
};

var awaitPause = () => {
    let a;
    return new Promise( ( res , rej ) =>{
        a = setInterval(()=>{
            ( !srtg && !playT ? draw() : null );
            if( !srtg ){
                rej();
                clearInterval(a);
                if( playT ){
                    reset();
                    draw();
                }
                return;
            }
            if( playT ){
                res();
                clearInterval(a);
                return;
            }
        }, 100);
    });//.then( () => clearInterval(a) ).catch( () => clearInterval(a) );
}

async function init(){
    for( let i = 0 ; i < meter.value ; i ++ )
        array.push( aux.r(99) );
    
    aux.w = width / meter.value;

    updateIterations( 0 );
    draw();
}

function initFAB(){
    let backB = document.getElementById('f-back');
    let playB = document.getElementById('f-play');
    let fastB = document.getElementById('f-fast');

    backB.style.opacity = 1;
    playB.style.opacity = 1;
    fastB.style.opacity = 1;

    backB.onclick = () => updateIterations( -1 );

    var holdRewind;
    backB.addEventListener("mousedown", (e)=>{
        holdRewind = setInterval( ()=> updateIterations( -1 ), 150 );
    });

    backB.addEventListener("mouseup", (e)=>{
        clearInterval( holdRewind );
    });

    backB.addEventListener("mouseout", (e)=>{
        clearInterval( holdRewind );
    });

    playB.onclick = async () =>{
        if( playT ){
            playB.innerHTML = `<img src="img/play.png" alt="▶" draggable="false">`;
            if( srtg ){
                playT = false;
            }
        }else{
            playB.innerHTML = `<img src="img/pause.png" alt="⏸️" draggable="false">`;
            playT = true;
            if( !srtg )
                sorting();
        }
    };

    fastB.onclick = () => updateIterations( 1 );

    var holdFastF;
    fastB.addEventListener("mousedown", (e)=>{
        holdFastF = setInterval( ()=> updateIterations( 1 ), 150 );
    });

    fastB.addEventListener("mouseup", (e)=>{
        clearInterval( holdFastF );
    });

    fastB.addEventListener("mouseout", (e)=>{
        clearInterval( holdFastF );
    });
}

function restart(){
    srtg = false;
    array.splice( 0 , array.length ); //  empty array
    init();
}

async function updateIterations( num ){
    iPS = iPS + num;

    if( iPS <= 0 )
        iPS = 1;
    
    if( iPS >= 5 )
        timer = 100/iPS;
    else
        timer = 1000/iPS;
    xpeed.innerHTML = " " + iPS + "x";

    sleep = (cb=()=>{}) => new Promise( async ( res , rej ) => {
        await awaitPause().then(()=>{ // grants that nothing executes during pause
            setTimeout( ()=>{cb();res();}, timer );
        }).catch(()=>{
            rej();
        });
    });
}

function draw(){
    ctx.clearRect(0,0,width,height);

    for( let i = 0 ; i < array.length ; i++ ){
        force = true;
        drawItem( i );
    }
        

}

function drawItem( i , color = aux.n , y = 0, font = "16px Arial" ){
    if( !srtg && playT && !force )
        return;

    ctx.clearRect( i * aux.w , 0 , aux.w , height );

    ctx.fillStyle = color;
    ctx.font = font;

    ctx.fillRect( i * aux.w + 2  , y , aux.w - 4 , array[i] * aux.h );
    ctx.fillText( array[i] , i * aux.w + 5 , y + array[i] * aux.h + 15 );

    force = false;
}

function sorting(){
    srtg = true;
    draw();

    switch( menu.value ){
        case sort.MERGE:
            console.log("Merge")
            mergeSort( 0 , array.length-1 );
            break;
        case sort.HEAP:
            console.log("Heap")
            heapSort();
            break;
        case sort.BUBBLE:
            console.log("Bubble")
            bubbleSort();
            break;
        case sort.SELECT:
            console.log("Select")
            selectSort();
            break;
    }
}

function swap( i0 , i1 ){
    let temp = array[i0];
    array[i0] = array[i1];
    array[i1] = temp;
}

function reset(){
    srtg = false;
    document.getElementById('f-play').innerHTML = `<img src="img/play.png" alt="▶">`;
    playT = false;
}

async function heapSort(){
    try{
        let n = array.length;

        for( let i = parseInt( n / 2 ) - 1 ; i >= 0 ; i-- )
            await heapify( n , i );
        
        for( let i = n - 1 ; i >= 0 ; i-- ){
            drawItem( 0 , aux.s ); // select
            drawItem( i , aux.s ); // select
            await sleep();
            swap( i , 0 );
            drawItem( 0 , aux.s ); // select
            drawItem( i , aux.s ); // select
            await sleep();
            drawItem( 0 ); // unselect
            drawItem( i , aux.f ); // fixed
            await sleep();
            await heapify( i , 0 );
        }

        reset();

    }catch( err ){
        console.log( "End of execution" );
    }
}

function heapify( n , i ){
    return new Promise( async resolve => {
        try{
            let largest = i;
            let left = 2 * i + 1;
            let right = 2 * i + 2;

            if( left < n && array[left] > array[largest] )
                largest = left;

            if( right < n && array[right] > array[largest] )
                largest = right;
            
            if( largest != i ){
                drawItem( i , aux.s ); // select
                drawItem( largest , aux.s ); // select
                await sleep();
                swap( i , largest );
                drawItem( i , aux.s ); // select
                drawItem( largest , aux.s ); // select
                await sleep();
                drawItem( i ); // unselect
                drawItem( largest ); // unselect
                await sleep();
                await heapify( n , largest );
                resolve();
            }else{
                resolve();
            }
        }catch( err ){
            console.log( "End of execution" );
        }
    });
}

async function merge( l , m , r ){
    return new Promise( async resolve =>{
        let n1 = m - l + 1;
        let n2 = r - m;
    
        let L = [];
        let R = [];
    
        for( let i = 0 ; i < n1 ; i++ )
            L.push( array[ l+i ] );
        for( let j = 0 ; j < n2 ; j++ )
            R.push( array[ m+1+j ] );
        
        let i = 0;
        let j = 0;
    
        let k = l;
        while( i < n1 && j < n2 ){
            drawItem( l+i , aux.s ); // select
            drawItem( m+1+j , aux.s ); // select
            await sleep();
            if( L[i] <= R[j] ){
                array[k] = L[i];
                i++;
            }else{
                array[k] = R[j];
                j++;
            }
            drawItem( l+i ); // unselect
            drawItem( m+1+j ); // unselect
            await sleep();
            k++;
        }
    
        while( i < n1 ){
            array[k] = L[i];
            i++;
            k++;
        }
    
        while( j < n2 ){
            array[k] = R[j];
            j++;
            k++;
        }
    
        resolve();

    });
}

async function mergeSort( l , r ){
    try{
        if( l < r ){
            let m = parseInt((l+r)/2);
    
            await mergeSort( l , m );
            await mergeSort( m+1 , r );
    
            await merge( l , m , r );
        }

    }catch( err ){
        console.log( "End of execution" );
    }
}

async function bubbleSort(){
    try{
        let n = array.length;

        for( let i = 0 ; i < n-1 ; i++ ){
            for( let j = 0 ; j < n-i-1 ; j++ ){
                drawItem( j , aux.s ); // select
                drawItem( j+1 , aux.s ); // select
                await sleep();
                if( array[ j ] > array[ j+1 ] ){
                    swap( j , j+1 );
                    drawItem( j , aux.s ); // select
                    drawItem( j+1 , aux.s ); // select
                    await sleep();
                }
                drawItem( j ); // unselect
                if( j === n-i-2 )
                    drawItem( j+1 , aux.f ); // fixed
                else
                    drawItem( j+1 ); // unselect
                await sleep();
            }
        }

        drawItem( 0 , aux.f ); // fixed

        reset();
    }catch( err ){
        console.log( "End of execution" );
    }
}

async function selectSort(){
    try{
        let n = array.length;

        for( let i = 0 ; i < n-1 ; i++ ){
            let min_idx = i;
            let lst = min_idx;
            for( let j = i+1 ; j < n ; j++ ){
                drawItem( min_idx , aux.s ); // select
                drawItem( j , aux.s ); // select
                await sleep();
                if( array[ j ] < array[ min_idx ] ){
                    min_idx = j;
                    drawItem( lst ); // unselect
                    drawItem( min_idx , aux.s );
                    lst = min_idx;
                }else{
                    drawItem( j ); // unselect
                }
                await sleep();
            }
            swap( min_idx , i );
            drawItem( min_idx );
            drawItem( i , aux.f ); // fixed
            await sleep();
        }

        drawItem( n-1 , aux.f ); // fixed

        reset();
    }catch( err ){
        console.log( "End of execution" );
    }
}

window.onload = init();