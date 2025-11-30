import React, { useState } from 'react';
import HomeNavbar from '../components/HomeNavbar';
import '../styles/Helpcentrum.css';

const Helpcentrum = () => {
    const [openSection, setOpenSection] = useState(null);

    const toggleSection = (sectionId) => {
        setOpenSection(openSection === sectionId ? null : sectionId);
    };

    const faqCategories = [
        {
            id: 'algemeen',
            title: 'Algemene Vragen',
            icon: '📋',
            questions: [
                {
                    q: 'Wat is Flora Veiling?',
                    a: 'Flora Veiling is een professioneel bloemenveiling platform waar u kunt bieden op premium bloemen van over de hele wereld. Ons unieke systeem biedt transparante en eerlijke veilingen met real-time biedmogelijkheden.'
                },
                {
                    q: 'Hoe werkt het veiling systeem?',
                    a: 'Ons veiling systeem werkt met een aflopende prijs. De prijs daalt geleidelijk en u kunt op elk moment bieden. De eerste bieder wint de veiling op de aangegeven prijs.'
                },
                {
                    q: 'Zijn er kosten verbonden aan het gebruik van het platform?',
                    a: 'Registreren en bieden op Flora Veiling is gratis. Alleen wanneer u daadwerkelijk een veiling wint, worden de kosten van het product in rekening gebracht.'
                }
            ]
        },
        {
            id: 'account',
            title: 'Account & Registratie',
            icon: '👤',
            questions: [
                {
                    q: 'Hoe registreer ik een account?',
                    a: 'Klik op de "Registreren" knop in de navigatiebalk. U kunt kiezen tussen drie accounttypes: Koper, Aanvoerder of Veilingmeester. Vul het registratieformulier in en volg de instructies.'
                },
                {
                    q: 'Welke accounttypes zijn er?',
                    a: 'Er zijn drie accounttypes: Koper (voor het bieden op veilingen), Aanvoerder (voor het aanbieden van producten) en Veilingmeester (voor het beheren van veilingen).'
                },
                {
                    q: 'Ik ben mijn wachtwoord vergeten, wat nu?',
                    a: 'Neem contact op met onze klantenservice via de contactgegevens op deze pagina. Wij helpen u graag verder met het resetten van uw wachtwoord.'
                },
                {
                    q: 'Kan ik mijn accounttype later wijzigen?',
                    a: 'U kunt niet zelf uw accounttype wijzigen. Neem contact op met onze support als u van accounttype wilt wisselen.'
                }
            ]
        },
        {
            id: 'bieden',
            title: 'Bieden & Veilingen',
            icon: '💰',
            questions: [
                {
                    q: 'Hoe bied ik op een veiling?',
                    a: 'Om te bieden moet u ingelogd zijn met een Koper account. Navigeer naar de Veilingzaal, kies een veiling waarop u wilt bieden en klik op de "Bieden" knop.'
                },
                {
                    q: 'Wanneer wordt een veiling afgesloten?',
                    a: 'Een veiling sluit af wanneer een koper biedt of wanneer de eindtijd is bereikt. U kunt de eindtijd en huidige status zien op de veilingkaart.'
                },
                {
                    q: 'Kan ik mijn bod intrekken?',
                    a: 'Nee, zodra u heeft geboden, kunt u het bod niet meer intrekken. Zorg er daarom voor dat u zeker bent van uw bod voordat u biedt.'
                },
                {
                    q: 'Hoe weet ik of ik een veiling heb gewonnen?',
                    a: 'Als u een veiling wint, ontvangt u een e-mailnotificatie en ziet u de gewonnen veiling in "Mijn Veilingen".'
                }
            ]
        },
        {
            id: 'betaling',
            title: 'Betaling & Levering',
            icon: '💳',
            questions: [
                {
                    q: 'Welke betaalmethoden worden geaccepteerd?',
                    a: 'We accepteren verschillende betaalmethoden, waaronder bankoverschrijving en andere veilige betaalopties. Meer informatie vindt u in uw accountinstellingen.'
                },
                {
                    q: 'Wanneer moet ik betalen?',
                    a: 'U moet betalen zodra u een veiling heeft gewonnen. U ontvangt betalingsinstructies via e-mail en in uw account.'
                },
                {
                    q: 'Wat zijn de levertijden?',
                    a: 'Levertijden variëren per product en locatie. Over het algemeen is de levertijd binnen 24-48 uur na betaling. Exacte levertijden worden getoond bij elke veiling.'
                },
                {
                    q: 'Krijg ik een bevestiging van mijn bestelling?',
                    a: 'Ja, na het winnen van een veiling ontvangt u een orderbevestiging via e-mail met alle details van uw aankoop.'
                }
            ]
        },
        {
            id: 'producten',
            title: 'Producten & Kwaliteit',
            icon: '🌷',
            questions: [
                {
                    q: 'Wat voor bloemen kan ik kopen?',
                    a: 'Ons platform biedt een breed scala aan premium bloemen, waaronder rozen, tulpen, orchideeën, lelies en vele andere soorten van geselecteerde leveranciers wereldwijd.'
                },
                {
                    q: 'Hoe wordt de kwaliteit van de bloemen gegarandeerd?',
                    a: 'We werken uitsluitend samen met geverifieerde en geselecteerde leveranciers. Alle producten worden gecontroleerd voordat ze op veiling worden gezet.'
                },
                {
                    q: 'Wat als ik niet tevreden ben met mijn aankoop?',
                    a: 'Als u niet tevreden bent met uw aankoop, neem dan binnen 24 uur contact op met onze klantenservice. Wij bekijken elk geval individueel en vinden een passende oplossing.'
                }
            ]
        },
        {
            id: 'aanvoerder',
            title: 'Voor Aanvoerders',
            icon: '🚚',
            questions: [
                {
                    q: 'Hoe voeg ik producten toe?',
                    a: 'Log in met uw Aanvoerder account en ga naar uw dashboard. Klik op "Nieuw Product" en vul alle vereiste informatie in, inclusief afbeeldingen en productdetails.'
                },
                {
                    q: 'Wat zijn de kosten voor het aanbieden van producten?',
                    a: 'Neem contact op met ons sales team voor informatie over de kostenstructuur voor aanvoerders.'
                },
                {
                    q: 'Hoe lang duurt het voordat mijn product op veiling staat?',
                    a: 'Na het toevoegen van uw product, wordt het door een Veilingmeester beoordeeld en goedgekeurd. Dit duurt meestal 24-48 uur.'
                }
            ]
        },
        {
            id: 'contact',
            title: 'Contact & Support',
            icon: '📞',
            questions: [
                {
                    q: 'Hoe kan ik contact opnemen met de klantenservice?',
                    a: 'U kunt contact opnemen via e-mail op support@floraveiling.nl of bel ons op +31 20 123 4567. Onze klantenservice is 24/7 beschikbaar.'
                },
                {
                    q: 'Wat zijn de openingstijden van de klantenservice?',
                    a: 'Onze klantenservice is 24/7 beschikbaar via e-mail en chat. Telefonische ondersteuning is beschikbaar van maandag tot vrijdag, 9:00 tot 18:00.'
                },
                {
                    q: 'Waar vind ik meer informatie over het bedrijf?',
                    a: 'Bezoek onze homepage voor meer informatie over Flora Veiling, ons verhaal en onze missie.'
                }
            ]
        }
    ];

    return (
        <div className="helpcentrum-page">
            <HomeNavbar activePage="/helpcentrum" />
            
            <main className="helpcentrum-main">
                <div className="helpcentrum-header">
                    <h1>Helpcentrum</h1>
                    <p>Vind hier antwoorden op uw vragen</p>
                </div>

                <div className="search-section">
                    <input
                        type="text"
                        placeholder="Zoek naar vragen..."
                        className="search-input"
                    />
                </div>

                <div className="faq-container">
                    {faqCategories.map((category) => (
                        <div key={category.id} className="faq-category">
                            <button
                                className="category-header"
                                onClick={() => toggleSection(category.id)}
                            >
                                <span className="category-icon">{category.icon}</span>
                                <h2>{category.title}</h2>
                                <span className={`expand-icon ${openSection === category.id ? 'open' : ''}`}>
                                    ▼
                                </span>
                            </button>
                            
                            {openSection === category.id && (
                                <div className="questions-list">
                                    {category.questions.map((item, index) => (
                                        <div key={index} className="faq-item">
                                            <div className="question">
                                                <strong>{item.q}</strong>
                                            </div>
                                            <div className="answer">
                                                {item.a}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="contact-section">
                    <h2>Kon u het antwoord niet vinden?</h2>
                    <p>Neem contact op met onze klantenservice</p>
                    <div className="contact-buttons">
                        <a href="mailto:support@floraveiling.nl" className="contact-btn email-btn">
                            📧 E-mail ons
                        </a>
                        <a href="tel:+31201234567" className="contact-btn phone-btn">
                            📞 Bel ons
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Helpcentrum;

