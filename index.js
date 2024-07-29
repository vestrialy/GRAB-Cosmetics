async function fetchCosmetics() {
    try {
        const response = await fetch('https://api.slin.dev/grab/v1/get_shop_catalog?version=2');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching cosmetics data:", error);
        return null;
    }
}

async function fetchItemPacks() {
    try {
        const response = await fetch('https://api.slin.dev/grab/v1/get_shop_products?version=2');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching item packs data:", error);
        return null;
    }
}

async function fetchShopItems() {
    try {
        const response = await fetch('https://api.slin.dev/grab/v1/get_shop_items?version=2');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching shop items data:", error);
        return null;
    }
}

function getCategoryIcon(title) {
    switch (title.toLowerCase()) {
        case 'heads':
            return '<i class="fas fa-user"></i> ';
        case 'body':
            return '<i class="fas fa-tshirt"></i> ';
        case 'hats':
            return '<i class="fas fa-hat-cowboy-side"></i> ';
        case 'glasses':
            return '<i class="fas fa-glasses"></i> ';
        case 'facewear':
            return '<i class="fas fa-mask"></i> ';
        case 'hands':
            return '<i class="fas fa-hand-rock"></i> ';
        case 'grapples':
            return '<i class="fas fa-hand-sparkles"></i> ';
        case 'checkpoints':
            return '<i class="fas fa-flag-checkered"></i> ';
        default:
            return '';
    }
}

function renderCategories(data) {
    const categoriesContainer = document.getElementById('categories');

    data.forEach(section => {
        if (section.title === "Open Shop") {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category';
            categoryDiv.innerHTML = `<i class="fas fa-shopping-cart"></i> Item Packs`;
            categoryDiv.addEventListener('click', async () => {
                const itemPacks = await fetchItemPacks();
                if (itemPacks) {
                    renderItemPacks(itemPacks);
                }
            });
            categoriesContainer.appendChild(categoryDiv);
        } else if (section.title === "Edit Character") {
            const sections = section.sections.filter(subSection =>
                subSection.title !== "Change Main Color" &&
                subSection.title !== "Change Detail Color"
            );

            sections.forEach(subSection => {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'category';
                categoryDiv.innerHTML = getCategoryIcon(subSection.title) + subSection.title;
                categoryDiv.addEventListener('click', async () => {
                    const shopItems = await fetchShopItems();
                    const itemPacks = await fetchItemPacks();
                    renderItems(subSection, shopItems, itemPacks);
                });
                categoriesContainer.appendChild(categoryDiv);
            });
        }
    });
}

async function renderItems(section, shopItems, itemPacks) {
    const contentContainer = document.getElementById('content');
    contentContainer.innerHTML = '';

    if (!section.items) {
        console.error("Items not found for section:", section.title);
        return;
    }

    renderCosmeticCount(section);

    section.items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';

        const title = shopItems[item] ? shopItems[item].title : item;

        let packTitle = 'None';
        for (const pack of Object.values(itemPacks)) {
            if (pack.items && pack.items.includes(item)) {
                packTitle = pack.title;
                break;
            }
        }

        itemDiv.innerHTML = `<h3>${title}</h3>
                             <img src="CosmeticsPNG/${item}.png" alt="${title}">
                             <p>Included in: ${packTitle}</p>`;
        contentContainer.appendChild(itemDiv);
    });

    // Add default items based on section title
    if (section.title.toLowerCase() === 'heads') {
        const defaultHeadDiv = document.createElement('div');
        defaultHeadDiv.className = 'item';
        defaultHeadDiv.innerHTML = `<h3>Default Head</h3>
                                    <img src="CosmeticsPNG/default_head.png" alt="Default Head">
                                    <p>Included in: Default</p>`;
        contentContainer.appendChild(defaultHeadDiv);
    }

    if (section.title.toLowerCase() === 'hands') {
        const defaultHandsItems = ['claw_hands'];
        defaultHandsItems.forEach(item => {
            const defaultHandsDiv = document.createElement('div');
            defaultHandsDiv.className = 'item';
            defaultHandsDiv.innerHTML = `<h3>Default Hands</h3>
                                         <img src="CosmeticsPNG/${item}.png" alt="Default Hands">
                                         <p>Included in: Default</p>`;
            contentContainer.appendChild(defaultHandsDiv);
        });
    }

    if (section.title.toLowerCase() === 'grapples') {
        const defaultGrappleDiv = document.createElement('div');
        defaultGrappleDiv.className = 'item';
        defaultGrappleDiv.innerHTML = `<h3>Default Grapple</h3>
                                       <img src="CosmeticsPNG/default_grapple.png" alt="Default Grapple">
                                       <p>Included in: Default</p>`;
        contentContainer.appendChild(defaultGrappleDiv);
    }

    if (section.title.toLowerCase() === 'checkpoints') {
        const defaultCheckpointDiv = document.createElement('div');
        defaultCheckpointDiv.className = 'item';
        defaultCheckpointDiv.innerHTML = `<h3>Default Checkpoint</h3>
                                           <img src="CosmeticsPNG/default_checkpoint.png" alt="Default Checkpoint">
                                           <p>Included in: Default</p>`;
        contentContainer.appendChild(defaultCheckpointDiv);
    }
}

function renderCosmeticCount(section) {
    const cosmeticCountElement = document.getElementById('cosmetic-count');
    const itemCount = section.items ? section.items.length : 0;
    cosmeticCountElement.textContent = `Showing ${itemCount} Cosmetics`;
}

function renderPackCount(packCount) {
    const cosmeticCountElement = document.getElementById('cosmetic-count');
    cosmeticCountElement.textContent = `Showing ${packCount} Packs`;
}

async function renderItemPacks(itemPacks) {
    const contentContainer = document.getElementById('content');
    contentContainer.innerHTML = '';
    let packCount = 0;
    const currentDate = Math.floor(Date.now() / 1000);

    // Get the base URL of the current page
    const baseUrl = window.location.origin;

    Object.values(itemPacks).forEach(pack => {
        if (!['100 Coins', '500 Coins', '1000 Coins', '2100 Coins', '5500 Coins', 'Admin Items', 'Moderator Items', 'Community Badge', 'Content Creator Badge', 'Pride Pin', 'GAB 1 Participant', 'GAB 1 Winner'].includes(pack.title)) {
            const active = pack.active && (!pack.date_end || pack.date_end > currentDate);
            const price = pack.price_currency ? pack.price_currency : (pack.price_usd ? `${pack.price_usd} USD` : 'Free');
            const packDiv = document.createElement('div');
            packDiv.className = `item pack ${pack.items.length === 1 ? 'single' : 'multiple'}`;

            const itemImages = pack.items.map(item => `<img src="CosmeticsPNG/${item}.png" alt="${item}" title="${item}" />`).join('');

            // Create the pack URL dynamically based on the current URL and pack title
            const packUrl = `${baseUrl}/${encodeURIComponent(pack.title.replace(/ /g, '-'))}`;

            console.log(`Generated URL: ${packUrl}`); // Log the generated URL

            packDiv.innerHTML = `<h3>${pack.title}</h3>
                                 ${itemImages}
                                 <p>${pack.description}</p>
                                 <p>Price: ${price}</p>
                                 <p>Active: ${active ? 'True' : 'False'}</p>`;

            // Add click event to navigate to the URL
            packDiv.addEventListener('click', () => {
                console.log(`Navigating to: ${packUrl}`); // Log the URL when clicked
                window.location.href = packUrl;
            });

            contentContainer.appendChild(packDiv);
            packCount++;
        }
    });

    renderPackCount(packCount);
}


async function init() {
    const data = await fetchCosmetics();
    if (data) {
        renderCategories(data);
    }
}

init();
