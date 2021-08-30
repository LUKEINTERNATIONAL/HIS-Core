<template>
    <div class='print-section'> 
        <center>
        <img src='assets/images/zebra-label-printer.jpeg'/>
            <h1> Printing in progress </h1>
            <h3> Please wait.... </h3>
        </center>
    </div>
</template>
<style scoped>
    .print-section {
        position: absolute;
        width: 96%;
        top: 50%;
        margin: 0;
        -ms-transform: translateY(-50%);
        transform: translateY(-50%);
    }
    img {
        width: 50%;
    }
    h1 {
        font-weight: bold;
    }
</style>