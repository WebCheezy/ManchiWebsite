/**
 * Terms and conditions as provided by Manchi Takeout / Manchi Concierge Limited.
 * Minor typographical fixes only (e.g. consistent email spelling where obvious).
 */
export function TermsBody() {
  return (
    <article className="legal-prose space-y-8 text-foreground">
      <header className="space-y-2 border-b border-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Terms &amp; Conditions</h1>
        <p className="text-sm text-muted-foreground">
          Manchi Takeout (&quot;the Site&quot;) — owned and operated by Manchi Concierge Limited trading as
          Manchi Takeout. Registered office: No 2, Beside Building Perfect World Plaza, Eneka, Rumuesera
          Town, Eneka, Rivers State, Nigeria. This document is only available in English.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Terms and conditions for visitors</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The following constitutes a legal agreement between a visitor (&quot;you&quot; / &quot;buyer&quot;) and us with
          respect to our website service. You must be at least 18 years of age to agree to and enter into
          this Agreement on your own behalf and to register for use of this Site. If you are under 18 but
          at least 15 years of age, you must present this Agreement to your parent or legal guardian.
          Children under the age of 15 may not register on this Site, and parents or legal guardians may
          not register on their behalf.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          When registering on our Site or purchasing a Product, by checking the box indicating your
          acceptance of this Agreement, you represent that (i) you have read, understood and agree to be
          bound by this Agreement and (ii) you are at least 18 years old, either entering into this
          Agreement for yourself or entering into it on behalf of your child or a child in your legal care.
          If you are a parent or guardian entering this Agreement for the benefit of your child, please be
          aware that you are fully responsible for his or her use of this Site, including all legal
          liability that he or she may incur. Each registration is for a single user only. We do not permit
          you to share your username or password with any other person nor with multiple users on a
          network. If you do not agree to (or cannot comply with) any of these terms and conditions, do not
          check the acceptance box when registering on our Site or purchasing a Product and do not attempt
          to access the Site.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Our Site is established to enable you to choose and purchase products from our Site
          (&quot;Products&quot; / &quot;Goods&quot;) that we offer for sale online.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Terms &amp; conditions for purchase of products</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            These terms and conditions shall apply to the sale of the Products by Manchi Takeout to you to
            the exclusion of all other terms and conditions referred where you have agreed to such variation
            in writing and by way of signature. By ordering from Manchi Takeout, you agree to be legally
            bound by these Terms and Conditions and accept that these conditions may be modified or amended
            and posted on the Site from time to time.
          </li>
          <li>Please note that to place an order, we normally require at least an hour&apos;s notice within the hours of 9am to 7pm.</li>
          <li>Our opening times are Mondays to Sundays from 9am to 7pm.</li>
          <li>Orders placed outside our working hours will be attended to on the next working day.</li>
          <li>
            Your order constitutes an offer to us to buy a Product. After placing an order, you will receive
            an email from us. This email is an Order Confirmation to notify you of the fact we have received
            and accepted your order. This order confirmation acts as an invoice.
          </li>
          <li>
            Your purchase order cannot be accepted until payment in full for the Products ordered has been
            received by us at which time a legally binding agreement on the terms set out herein will become
            effective.
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Product information</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            The images on our website or social media pages are examples of our food. All our products are
            handmade and can be ordered in different portions from those shown on the website or social media
            pages.
          </li>
          <li>
            Due to the above mentioned, your product may have variations from the images on the
            Application, website or social media pages.
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Price &amp; payment</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>Please note that Manchi Takeout requires 100% non-refundable payment to confirm the Buyer&apos;s order.</li>
          <li>
            The price to be paid by you for any Products will be as quoted on our Site except in cases of
            obvious error. We are under no obligation to provide the Product to you at the incorrect (lower)
            price, even after we have sent you an invoice, if the pricing error is obvious and unmistakable
            and could have reasonably been recognised by you as an incorrect pricing.
          </li>
          <li>
            Our prices include VAT but exclude delivery costs, which will be added to the total amount due
            before completion of your order.
          </li>
          <li>Prices are liable to change at any time, but changes will not affect orders in respect of which we have already sent you an invoice.</li>
          <li>Orders CANNOT be cancelled with less than 15 minutes&apos; notice.</li>
          <li>
            Our site may contain a large number of Products and it is always possible that, despite our best
            efforts, some of the Products listed on our Site may be incorrectly priced. We will normally
            verify prices as part of our order confirmation procedures, so that where a Product&apos;s correct
            price is less than our stated price, we will charge the lower amount when invoicing you. If a
            Product&apos;s correct price is higher than the price stated on our Site, or we are no longer able
            to supply a particular Product for some reason, we will contact you by email to advise you and/or
            to obtain your confirmation that the amended price is acceptable.
          </li>
          <li>
            Payment for all Products must be made via our Site either by debit card or transfer, and
            transfers to account details on invoices sent and those accepted by us are those listed on our
            website/app on the date when your order is placed. We will send you an email upon receipt of
            payment.
          </li>
          <li>
            All debit cardholders are subject to validation checks and authorisation by the card issuer. If
            the issuer of your payment card refuses or for any reason does not authorise payment to us,
            whether in advance of or subsequent to a payment, we will not be liable for any delay or
            non-delivery of the Products ordered.
          </li>
        </ol>
      </section>

      <TermsBodyContinued />
    </article>
  )
}

function TermsBodyContinued() {
  return (
    <>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Availability, delivery &amp; collection</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>You are expected to pick up your order during our working hours.</li>
          <li>
            If for any reason you find yourself unable to collect your order from the designated shop within
            the given time slot, we will retain your ordered Products for collection by you for 24 hours.
            However, please note that we will not be held responsible for products not picked up on the
            agreed pick up date.
          </li>
          <li>Manchi Takeout will not take back any undamaged goods from the buyer unless agreed in writing by Manchi Takeout.</li>
          <li>We cannot be held liable for damages to the food or products once they have been picked up by the Buyer.</li>
          <li>
            We cannot be held liable for damages to products delivered, once the products have been set up at
            the delivery location and we have received a confirmation for the safe receipt of the goods.
          </li>
          <li>
            We will always endeavour to dispatch the products within the allocated time slot. However,
            delivery timings cannot be specified or guaranteed.
          </li>
          <li>Manchi Takeout will not be held liable for deliveries delayed by factors beyond our control e.g., traffic, heavy rain, flood, etc.</li>
          <li>In the event of anticipated delays, Manchi Takeout will inform the Buyer immediately.</li>
          <li>
            Refunds will not be given for delayed deliveries especially in unforeseen circumstances, as
            stated above. If in the unlikely event the delivery is delayed, we will always endeavour to
            deliver the products to you as soon as possible.
          </li>
          <li>
            Upon collection/delivery, it is important to note that Products displayed outside are liable to
            react to the temperature. In hot or humid environments, there is the possibility of food getting
            spoiled, if not properly stored after receipt. We, therefore, advise the Buyer takes this into
            consideration when placing an order.
          </li>
          <li>ALL our food MUST be refrigerated to avoid damage, if not consumed immediately after delivery and for not more than 12 hours.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Risk &amp; title</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>The Products will be at your risk from the time you collect the Products from our kitchen or we deliver them to you.</li>
          <li>Ownership of the Products will only pass to you when we receive full payment of all sums due for them, including delivery charges.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Returns policy</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            We do hope that you will be pleased with your purchase. However, if upon collection or delivery
            of the Products you find that they are not those ordered by you (for example, the size or
            wording is incorrect), or the order is incomplete, or a Product is in a damaged condition when
            you receive it, or of poor quality, please either return to the bakery or notify us within 12
            hours via email at{" "}
            <a href="mailto:manchi_takeout@gmail.com" className="text-primary underline underline-offset-2">
              manchi_takeout@gmail.com
            </a>{" "}
            including an image of the Product as you received it and your order number. If a product is not
            as on the Order Confirmation or damaged, we will correct, replace or refund your purchase.
            Subject to our report on the claimed damage and to the Terms and Conditions we will refund the
            price you paid for the returned Products. We will have no liability to you for any indirect loss.
          </li>
          <li>Since taste is a very personal matter and subjective, we cannot accept the return of any Products merely because you do not like the taste.</li>
          <li>
            We have made every effort to display as accurately as possible the colours of our products that
            appear on our Site and to ensure that the colours on screen are as close as possible to the
            colours of the actual product. However, all products are made by hand so colours may vary.
            Accordingly, we cannot accept the return of any product because it does not match the shade you
            were expecting.
          </li>
          <li>
            If you wish to make a complaint to us or let us know any concerns after receiving the Products,
            please do so in writing by sending us an email to{" "}
            <a href="mailto:manchi_takeout@gmail.com" className="text-primary underline underline-offset-2">
              manchi_takeout@gmail.com
            </a>
            . Evidence of any faults, damages or discrepancies should be included.
          </li>
          <li>Refunds or replacements will be given at the discretion of Manchi Takeout.</li>
          <li>The provisions of this clause do not affect your statutory rights.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Our right to vary these terms &amp; conditions</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            We have the right to revise and amend these Terms and Conditions from time to time, for example,
            to reflect changes in market conditions affecting our business, changes in technology, changes in
            payment methods, changes in relevant laws and regulatory requirements and changes in our
            system&apos;s capabilities.
          </li>
          <li>
            You will be subject to the policies and Terms and Conditions in force at the time that you order
            Products from us, unless any change to those policies or these Terms and Conditions is required
            to be made by law or governmental authority (in which case it will apply to orders previously
            placed by you), or if we notify you of the change to those policies or these Terms and Conditions
            before we send you the invoice/order confirmation (in which case we have the right to assume that
            you have accepted the change to the Terms and Conditions).
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Your agreements</h2>
        <p className="text-sm font-medium text-foreground">YOU AGREE that:-</p>
        <ul className="list-[upper-alpha] space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            it is your responsibility to provide accurate personal information (&quot;Personal Data&quot;) and to
            update your Personal Data as necessary to keep it accurate. You undertake that all the details you
            provide to us for the purpose of selling and delivering Products to you are correct and that the
            credit card or debit card that you propose to use is your own or that of a third party who has
            given you full permission and authority to use it and that you or such third party have sufficient
            funds to meet the costs of Products ordered. We will not store your credit card or debit card
            details anywhere on the Site;
          </li>
          <li>it is your responsibility to ensure that your email address is current otherwise certain functions of the Site will not be available to you.</li>
          <li>
            it is your responsibility to maintain the confidentiality and security of your Personal Data
            especially your username and password. You will not allow others to use your username or password
            and you will notify us immediately of any unauthorised use of either of them. We shall not be
            responsible for any losses arising out of the unauthorised use of your username or password and
            you agree to indemnify and hold us harmless, for any improper, unauthorised or illegal uses of the
            same;
          </li>
          <li>we shall be entitled to withdraw from any purchase order made by you if the Product is inaccurately described on the Site or where obvious errors have been made;</li>
          <li>
            whilst we will utilise anti-virus protections, it is your obligation to ensure that any use you
            make of our Site is free of any virus, Trojan horse, worm or any other items of a destructive
            nature. You will not hold us responsible for any damages that result from you accessing the Site
            (including any software or systems you use to access the Site);
          </li>
          <li>you will not attempt or permit or encourage others to attempt to copy or make use of any intellectual property appearing on our Site for any commercial use or in any manner which would constitute an infringement of our copyright.</li>
          <li>variation in computer, browser and operation will create differences in visual layout and usability of the Site. We have given due care and attention to minimising these differences but cannot be held responsible for specific operational differences.</li>
        </ul>
      </section>

      <TermsBodyFinal />
    </>
  )
}

function TermsBodyFinal() {
  return (
    <>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">System requirements</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The computer, internet access and system operated by you and your ability to use the same may
          affect your ability to purchase any Products from our Site. You acknowledge and agree that any
          system requirements necessary to preview, and/or view and/or purchase any Products from our Site
          are your responsibility.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Misuse of the site</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            We reserve the right to suspend or terminate your access to the Site or parts of it if at our
            sole discretion we believe you are in breach of any provision of this Agreement. If your access
            has been suspended or terminated, you will not be permitted to re-register or to re-access the Site
            without our prior consent.
          </li>
          <li>You will only use the Site for the purposes referred to in this Agreement and not access the Site or use information gathered from it to send unsolicited emails.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Indemnity</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          You agree to indemnify and hold harmless us, our directors, employees and consultants from and
          against any and all claims, losses, demands, causes of action and judgments (including
          solicitors&apos; or attorneys&apos; fees and court costs) arising from or concerning any breach by you of
          this Agreement and/or these Terms and Conditions for your use of the Site and you agree to
          reimburse us on demand for any losses, costs or expenses we incur as a result thereof.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Assignment</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>You may not transfer or otherwise deal with your rights and/or obligations under these Terms and Conditions.</li>
          <li>We may sub-contract, transfer or otherwise deal with our rights and/or obligations under these Terms and Conditions in whole or in part.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">General</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>We may require you to change your username or password or any other information which permits you access to purchase Products from the Site.</li>
          <li>
            We have the right to withdraw any Product from the Site for any reason without notice to you and
            you agree that we will not be responsible for any loss, damage, or cost as a result of such
            unavailability.
          </li>
          <li>Our liability for losses you suffer as a result of us breaking this agreement is strictly limited to the purchase price of the Product you purchased.</li>
          <li>
            We will not be liable for errors or omissions on the Site nor for loss or damage suffered by you
            as a result of any unavailability of the Site or by any use by you or reliance placed on the Site
            or its contents including any damage caused to your computer or otherwise howsoever, or any
            direct, indirect or consequential loss or loss of data.
          </li>
          <li>We shall not be liable to you for the failure of any equipment, data processing system or transmission link and will not be liable to you as a result of any down-time which may occur upon the Site.</li>
          <li>
            The Site is provided &quot;as is&quot; and you acknowledge that despite our reasonable endeavours the Site
            may contain bugs, errors and other problems (including, but not by way of limitation) infection by
            viruses (despite anti-virus protections which may be incorporated) or anything else which may
            cause contamination or destruction of any sort that may cause system failures. Notwithstanding,
            we will use all reasonable endeavours to correct any errors and omissions as quickly as
            practicable after being notified by email to{" "}
            <a href="mailto:manchi_takeout@gmail.com" className="text-primary underline underline-offset-2">
              manchi_takeout@gmail.com
            </a>
            .
          </li>
          <li>We shall not be responsible to you for damages or otherwise in respect of any error made to any listing of or reference to Products.</li>
          <li>We reserve the right at any time and from time to time to modify or discontinue, temporarily or permanently the Site (or any part thereof) without notice to you and without any liability to you or to any third party.</li>
          <li>
            We reserve the right to deactivate your account if it has not been active for a period of 12
            months or more, and to remove it from the database if no communication has been received from
            you for a further 3 months after deactivation has occurred.
          </li>
          <li>
            Links to third party websites on the Site are provided solely for your convenience. If you use
            these links, you leave the Site. We have not reviewed all of these third party websites and do not
            control and are not responsible for these websites or their content or availability. We therefore
            do not endorse or make any representations about them, or any material found there, or any
            results that may be obtained from using them. If you decide to access any of the third-party
            websites linked to the Site, you do so entirely at your own risk.
          </li>
          <li>
            We welcome &apos;hot links&apos; to the Site, but not &apos;deep linking&apos; by which we mean that you may not
            include a link to our Site, or display the contents of our Site, surrounded, or framed or
            otherwise surrounded by content not originating from us without our consent. Any unauthorized
            framing of or linking to the Site will be investigated, and appropriate legal action will be
            taken, including without limitation, civil, criminal, and injunctive redress and may result in
            the termination of this Agreement or other remedies as set out in this Agreement.
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Intellectual property rights</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            All intellectual property content on the Site including, without limitation trademarks, button
            icons, logos, graphics, and images is owned by us and is protected by Copyright laws. Your use
            of them is governed by this Agreement, certain end-user licence agreements, and applicable law.
          </li>
          <li>
            You will infringe our rights if you copy or reproduce any part of the Site save for: (2.1) a
            temporary copy of any part of the Site which is automatically made or retained by your browser as
            you browse the Site; or (2.2) you printing out any pages from the Site as a record of any Products
            you have purchased from it; or (2.3) you printing out a copy of the Terms and Conditions which we
            would request you to do; or (2.4) your own personal use provided that no documents or related
            graphics on the Site are modified in any way; no graphics on the Site are used separately from
            the corresponding text; and the Company&apos;s copyright and trade mark notices and this permission
            notice appear in all copies. Other than for the above four exceptions you must not copy the
            intellectual property in question for any purpose. For the purposes of these Clauses 1 and 2,
            &quot;copy&quot; and &quot;copying&quot; shall include non-literal copying as well as the copying of the structure and
            form of the Site and any elements within it.
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Disclaimer</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">1.</strong> To the extent that in a particular circumstance any
          disclaimer or limitation on damages or liability set out in this Agreement is prohibited by any law
          which is applicable, then, instead of the provisions hereof in such particular circumstance, we
          shall be entitled to the maximum disclaimers and/or limitations on damages and liability available
          at law or in equity by such applicable law and in no event shall such damages or liability exceed
          five thousand naira (N5,000.00).
        </p>
        <p className="text-sm font-medium text-foreground">Concerning the Site:</p>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground" start={2}>
          <li>
            You understand and agree that your use of the Site is at your own sole risk. The Site is provided
            &quot;as is&quot; and without warranty by us, and, to the maximum extent allowed by applicable law, we
            expressly disclaim all warranties, express or implied including, but not limited to, implied
            warranties of merchantability and fitness for a particular purpose, and any warranty of
            non-infringement. We do not warrant, guarantee, or make any representations regarding the use or
            the results of the use of the Site with respect to performance, accuracy, reliability, security
            capability or otherwise. You will not hold us responsible for any damages that result from you
            accessing (including any software or systems you use to access) the website service or using the
            Site including, but not limited to, infection by virus, damage to any computer, software or
            systems or portable devices you use to access the same. No oral or written information or advice
            given by any person shall create a warranty or a representation from us.
          </li>
          <li>We make no warranty that any particular device or software you use will be compatible with this Site. It is your sole responsibility to ensure that your system(s) will function correctly with this Site.</li>
          <li>Under no circumstances shall we be liable for any unauthorised use of the Site or the Products.</li>
          <li>Under no circumstances shall we be liable to you for any direct, indirect, consequential, incidental or special damages arising out of your use of or inability to use the Site, even if we have been advised of the possibility of such damages.</li>
        </ol>
        <p className="text-sm font-medium text-foreground">Concerning the Products:</p>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground" start={6}>
          <li>
            The Products ordered are fresh on the day of delivery to or collection by you and will remain
            fresh for a further 1 week from the time of delivery or collection if kept by you in an airtight
            container/bag and in the refrigerator. Products placed in a fridge or a freezer or kept for a
            time longer than 24 hours are so kept at your own risk and we are not liable for any deterioration
            of the Products in these circumstances.
          </li>
          <li>
            Products which were due to be collected by you from our kitchen and which you failed to collect on
            the appointed day, or Products which we have taken back to our shop because you were not available
            to receive the same during the delivery slot agreed for you, will be kept by us. However, we would
            not be held liable for the condition of the Products at pick up or delivery after the stipulated
            or previously agreed date of collection.
          </li>
          <li>
            We cannot accept any responsibility for deterioration of the Products in these circumstances. We
            cannot accept responsibility for damage caused by you or by a courier/agent engaged by you to
            collect Products from our kitchen if they are damaged during transit to your home provided that
            you or your courier/agent has signed our &quot;delivery receipt&quot; confirming that the goods were in good
            condition and undamaged at the point of collection.
          </li>
          <li>
            Under no circumstances shall we be liable to you in respect of any complaint concerning any
            aspect of any Product which is not raised by you within 12 hours of delivery by us or collection
            by you or your courier/agent.
          </li>
          <li>
            All our products are made in a kitchen that handles nuts, gluten/wheat, dairy, egg and soya. We
            will notify you of any Product containing nuts or gelatine on the specific Product&apos;s web page.
            However, since our kitchens handle nuts we cannot guarantee that traces of nuts will not be found
            in our Products and therefore we do not accept any liability for any damage to health or any
            distress caused to you by the consumption of such Products.
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Third party rights</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This Agreement is only for the benefit of you and us and no other person can claim a benefit from
          this Agreement by virtue of the Privity of contract rule.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Law &amp; legal notices</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This Agreement and any other terms or documents referred to herein represent your entire agreement
          with us with respect to your use of this Site. If any part of this Agreement is held invalid or
          unenforceable, that portion shall be construed in a manner consistent with the applicable law to
          reflect, as nearly as possible, the original intentions of the parties, and the remaining
          portions shall remain in full force and effect. Nigerian Law governs this Agreement and your use of
          the Site, and you expressly agree that the Nigerian courts shall have exclusive jurisdiction over
          any claim or dispute between us or relating in any way to your account or your use of this Site.
        </p>
      </section>

      <section className="space-y-3 border-t border-border pt-6">
        <h2 className="text-lg font-semibold text-foreground">Acknowledgements</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          You acknowledge that we may change the terms of this Agreement by posting a new Agreement on the
          Site. You acknowledge that it is your responsibility to check the Site regularly to ascertain if
          changes have been made and your continued use of the Site after such a change will constitute your
          acceptance of the changes. By reading this Agreement and continuing to use this Site, you
          acknowledge that you have read, understood and agree to be bound by the Terms and Conditions of this
          Agreement which is available from every page of our website{" "}
          <a href="https://manchi.ng" className="text-primary underline underline-offset-2">
            manchi.ng
          </a>
          .
        </p>
      </section>
    </>
  )
}
