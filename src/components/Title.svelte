<h1 class="title">
    <span id="tofrom">From</span>
    <span id="goat">
        <span id="g-g">G</span><span id="g-o">o</span><span id="g-a">a</span><span id="g-t">t</span>
    </span>
    <span id="tofrom">to</span>
    <span id="despite">Despite</span>
</h1>

<style>
    .title {
        display: flex;
        flex-direction: row;
        align-items: start;
        text-transform: uppercase;
        font-family: var(--font-sans);
        gap: 1.25rem;
    }

    #tofrom{
        font-family: var(--font-mono);
        font-size: 35px;
        letter-spacing: 5%;
        font-weight: 400;
    }

    #goat, #despite{
        font-style: italic;
        font-size: 100px;
        font-weight: 200;
        padding: 0 1.2rem 0 0.75rem;
        color: var(--color-highlight-text);
        box-decoration-break: clone;
        background-repeat: no-repeat;
        background-size: 100% 1.25em;
        background-position: 0 70%; 
    }

    #despite{
        letter-spacing: -1%;
        background-image: linear-gradient(var(--color-ngsl-highlight), var(--color-ngsl-highlight));
    }

    #goat{
        font-family: var(--font-serif);
        background-image: linear-gradient(var(--color-gsl-highlight), var(--color-gsl-highlight));
        padding-left: 0.5rem;
    }

    #g-g{
        letter-spacing: -3%;
    }

    #g-o{
        letter-spacing: -8%;
    }

    #g-a{
        letter-spacing: -14%;
    }

    #g-t{
    }

</style>