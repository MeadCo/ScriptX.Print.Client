using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace ScriptX.Print.Client.Results
{
    class FileDownloadResult : IHttpActionResult
    {
        private readonly string _filePath;
        private readonly string _contentType;

        public FileDownloadResult(string filePath, string contentType = null)
        {
            if (filePath == null) throw new ArgumentNullException(nameof(filePath));

            _filePath = filePath;
            _contentType = contentType;
        }

        public Task<HttpResponseMessage> ExecuteAsync(CancellationToken cancellationToken)
        {
            var response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StreamContent(File.OpenRead(_filePath))
            };

            var contentType = _contentType ?? MimeMapping.GetMimeMapping(Path.GetExtension(_filePath));
            response.Content.Headers.ContentType = new MediaTypeHeaderValue(contentType);
            response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment") {
                FileName = Path.GetFileName(_filePath)
            };

            return Task.FromResult(response);
        }
    }

}