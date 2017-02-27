namespace ScriptX.Print.Client.Identity
{
    public class LicenseDetail
    {
        public LicenseDetail(string id)
        {
            Id = id;
        }

        public string Id { get; internal set; }

        public static LicenseDetail CreateLicense(string id)
        {
            return new LicenseDetail(id);
        }
    }
}