import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UpdateGurdwaraForm } from "./UpdateGurdwaraForm";
import { MapPin } from "lucide-react";

export function UpdateMapButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 px-6 py-3 rounded-full font-semibold"
        size="lg"
      >
        <MapPin className="mr-2 h-5 w-5" />
        Update Map
      </Button>
      <UpdateGurdwaraForm open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

