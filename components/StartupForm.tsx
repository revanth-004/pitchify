"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useActionState, useState } from "react";
import { Textarea } from "./ui/textarea";
import MDEditor from "@uiw/react-md-editor";
import { Send } from "lucide-react";
import { formSchema } from "@/lib/validation";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createPitch } from "@/lib/actions";

const StartupForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pitch, setPitch] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  const handleFormSubmit = async (prevState: any, formData: FormData) => {
    console.log("🚀 handleFormSubmit called");
    console.log("📝 prevState:", prevState);
    console.log("📋 formData entries:", Array.from(formData.entries()));
    try {
      const formValues = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        link: formData.get("link") as string,
        pitch,
      };
      console.log("📊 formValues:", formValues);
      await formSchema.parseAsync(formValues);

      console.log("🔄 Calling createPitch...");
      const result = await createPitch(prevState, formData, pitch);
      console.log("📤 createPitch result:", result);

      if (result.status == "SUCCESS") {
        toast({
          title: "Success",
          description: "Your startup pitch has been created successfully",
        });
        router.push(`/startup/${result._id}`);
      }
      return result;
    } catch (error) {
      console.log("❌ Error in handleFormSubmit:", error);
      if (error instanceof z.ZodError) {
        console.log("🔍 Zod validation error:", error.flatten());
        const fieldErrors = error.flatten().fieldErrors;
        setErrors(fieldErrors as unknown as Record<string, string>);
        toast({
          title: "Error",
          description: "Please check your inputs and try again",
          variant: "destructive",
        });
        return { ...prevState, error: "Validation failed", status: "ERROR" };
      }

      toast({
        title: "Error",
        description: "An unexpected error has occured",
        variant: "destructive",
      });

      return {
        ...prevState,
        error: "An unexpected error has occured",
        status: "ERROR",
      };
    }
  };
  const [state, formAction, isPending] = useActionState(handleFormSubmit, {
    error: "",
    status: "INITIAL",
  });

  const handleFormClick = (e: React.FormEvent) => {
    console.log("🖱️ Form submit button clicked");
    console.log("📝 Current pitch value:", pitch);
  };

  return (
    <form action={formAction} className="startup-form">
      <div className="">
        <label htmlFor="title" className="startup-form_label">
          Title
        </label>
        <Input
          id="title"
          name="title"
          className="startup-form_input"
          required
          placeholder="Startup Title"
        />
        {errors.title && <p className="startup-form_error">{errors.title}</p>}
      </div>
      <div className="">
        <label htmlFor="description" className="startup-form_label">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          className="startup-form_textarea"
          required
          placeholder="Startup Description"
        />
        {errors.description && (
          <p className="startup-form_error">{errors.description}</p>
        )}
      </div>
      <div className="">
        <label htmlFor="category" className="startup-form_label">
          category
        </label>
        <Input
          id="category"
          name="category"
          className="startup-form_input"
          required
          placeholder="startup Category (Tech, Health, Food...)"
        />
        {errors.category && (
          <p className="startup-form_error">{errors.category}</p>
        )}
      </div>
      <div className="">
        <label htmlFor="link" className="startup-form_label">
          Image URL
        </label>
        <Input
          id="link"
          name="link"
          className="startup-form_input"
          required
          placeholder="Startup Image URL"
        />
        {errors.link && <p className="startup-form_error">{errors.link}</p>}
      </div>

      <div data-color-mode="light">
        <label htmlFor="pitch" className="startup-form_label">
          Pitch
        </label>
        <MDEditor
          value={pitch}
          onChange={(value) => setPitch(value as string)}
          id="pitch"
          preview="edit"
          height={300}
          style={{ borderRadius: 20, overflow: "hidden" }}
          textareaProps={{
            placeholder:
              "Briefly describe your idea and what problem it solves",
          }}
          previewOptions={{ disallowedElements: ["style"] }}
        />
        {errors.pitch && <p className="startup-form_error">{errors.pitch}</p>}
      </div>
      <Button onClick={handleFormClick}>Testing</Button>

      <Button
        type="submit"
        className="startup-form_btn text-white"
        disabled={isPending}
        onClick={handleFormClick}
      >
        {isPending ? "Submitting..." : "Submit your pitch"}
        <Send className="size-8 ml-2" />
      </Button>
    </form>
  );
};

export default StartupForm;
