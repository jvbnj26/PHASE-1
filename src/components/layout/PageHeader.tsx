/** The compact colored title bar used by Contact, Events, Photos and Calendar. */
export default function PageHeader({ title, image }: { title: string; image?: string }) {
  return (
    <section className="relative overflow-hidden bg-primary py-8">
      {image && (
        <>
          <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/75" />
        </>
      )}
      <div className="container-custom relative">
        {title.trim() && (
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground">
            {title}
          </h1>
        )}
      </div>
    </section>
  );
}
