using DTOs.Enums;

namespace Repositories.Commons;
public static class ErrorMessages
{
    public static readonly Dictionary<CodeMessageEnums, string> Messages = new()
    {
        { CodeMessageEnums.MSG1, "Cannot create a new Claim Request as there is no Claim Request Configuration in the system. Please ask Administrator to create Claim Request Configuration in order to create new claims." },
        { CodeMessageEnums.MSG2, "This action will delete Claim permanently. Please click 'OK' to delete the claim or 'Cancel' to close the dialog." },
        { CodeMessageEnums.MSG3, "Please indicate that you have read and agree to the Terms and Conditions and Privacy Policy." },
        { CodeMessageEnums.MSG4, "Duplicated Claim. Please update your Claim information and submit again. Claim Duplicated: <<Claim ID>>" },
        { CodeMessageEnums.MSG5, "Please accept your Letter of Appointment in selected Run Details/Course Schedule first and submit again." },
        { CodeMessageEnums.MSG6, "This action will Submit Claim. Please click ‘OK’ to submit the claim or ‘Cancel’ to close the dialog." },
        { CodeMessageEnums.MSG7, "Please specify value for this field." },
        { CodeMessageEnums.MSG8, "This action will approve Claim. Please click ‘OK’ to approve the claim or ‘Cancel’ to close the dialog." },
        { CodeMessageEnums.MSG9, "This action will reject Claim. Please click ‘OK’ to reject the claim or ‘Cancel’ to close the dialog." },
        { CodeMessageEnums.MSG10, "This action will return Claim. Please click ‘OK’ to return the claim or ‘Cancel’ to close the dialog." },
        { CodeMessageEnums.MSG11, "This action will Reject claim. Please click ‘OK’ to return the claim or ‘Cancel’ to close the dialog." },
        { CodeMessageEnums.MSG12, "Please input your remarks in order to return Claim." },
        { CodeMessageEnums.MSG13, "This action will paid Claim. Please click ‘OK’ to receive the claim or ‘Cancel’ to close the dialog." },
        { CodeMessageEnums.MSG14, "This action will cancel Claim. Please click ‘OK’ to process the claim or ‘Cancel’ to close the dialog." },
        { CodeMessageEnums.MSG15, "Cannot create a new Generic claim as there is no Generic Claim Configuration in the system. Please ask Administrator to create Generic Claim Configuration in order to create new claims." },
        { CodeMessageEnums.MSG16, "Cannot submit as you do not have any developer record in the selected run. Please select another Run and submit again." },
        { CodeMessageEnums.MSG17, "Claim Type entered already exists. Please enter a new claim type." }
    };

    public static string GetMessage(CodeMessageEnums code)
    {
        return Messages.ContainsKey(code) ? Messages[code] : "Unknown error.";
    }
    
}
