<h1 class="title">
    <span id="couple-first">
        <span class="tofrom">From</span>
        <span id="goat">
            <span id="g-g">G</span><span id="g-o">o</span><span id="g-a">a</span><span id="g-t">t</span>
        </span>
    </span>
    <span id="couple-second">
        <span class="tofrom">to</span>
        <span id="despite">Despite</span>
    </span>
</h1>

<style>
    .title{
        --title-word-gap: 1.25rem;
        --title-d-bg-p: 46%;
    }

    .title {
        width: 100%;
        max-width: var(--max-prose-width);
        display: flex;
        flex-direction: row;
        align-items: start;
        justify-content: space-between;
        text-transform: uppercase;
        font-family: var(--font-sans);
        line-height: 0.8;
        gap: var(--title-word-gap);
        color: var(--color-highlight-text);
    }

    #couple-first, #couple-second{
        position: relative;
    }

    .tofrom{
        font-family: var(--font-mono);
        font-size: 35px;
        letter-spacing: 5%;
        font-weight: 400;
        position: absolute;
        top: 0;
        right: 100%;
        margin-right: var(--title-word-gap);

    }

    #goat, #despite{
        font-style: italic;
        font-size: 90px;
        font-weight: 200;
        padding: 0 1.2rem 0 0.75rem;
        color: var(--color-hero-headline);
        box-decoration-break: clone;
        background-repeat: no-repeat;
        background-size: 100% 0.9em;
    }

    @media (max-width: 920px) {
        .title{
            width: auto;
        }

        #goat, #despite{
            font-size: 64px;
        }
        .tofrom{
            font-size: 28px;
            position: relative;
            right: 0;
        }

        #couple-first, #couple-second{
            display: flex;
            align-items: flex-start;
        }
    }

    #despite{
        letter-spacing: -1%;
        background-image: linear-gradient(var(--color-ngsl-highlight), var(--color-ngsl-highlight));
        background-position: 0 var(--title-d-bg-p); 
    }

    #goat{
        font-family: var(--font-serif);
        background-image: linear-gradient(var(--color-gsl-highlight), var(--color-gsl-highlight));
        padding-left: 0.5rem;
        background-position: 0 calc(var(--title-d-bg-p) + 6.5%); 
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