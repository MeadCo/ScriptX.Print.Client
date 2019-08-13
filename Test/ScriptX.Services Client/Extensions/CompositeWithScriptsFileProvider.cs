using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Primitives;

namespace ScriptX.Services_Client.Extensions
{
    /// <summary>
    /// For the reasoning, see here: https://github.com/aspnet/Mvc/issues/7459
    /// 
    /// Summary we refer to library files as /scripts/[src|dist]/meadco-core.js, these are not stored
    /// under the webroot folder.
    /// </summary>
    class CompositeWithScriptsFileProvider : Microsoft.Extensions.FileProviders.IFileProvider
    {
        private readonly IFileProvider _webRootFileProvider;
        private readonly StaticFileOptions[] _staticFileOptions;

        public CompositeWithScriptsFileProvider(IFileProvider webRootFileProvider, StaticFileOptions[] staticFileOptions)
        {
            _webRootFileProvider = webRootFileProvider;
            _staticFileOptions = staticFileOptions;
        }

        public IDirectoryContents GetDirectoryContents(string subpath)
        {
            string outpath;
            var provider = GetFileProvider(subpath, out outpath);

            return provider.GetDirectoryContents(outpath);
        }

        public IFileInfo GetFileInfo(string subpath)
        {
            string outpath;
            var provider = GetFileProvider(subpath, out outpath);

            return provider.GetFileInfo(outpath);
        }

        public IChangeToken Watch(string filter)
        {
            string outpath;
            var provider = GetFileProvider(filter, out outpath);

            return provider.Watch(outpath);
        }

        internal IFileProvider GetFileProvider(string path,out string outpath)
        {
            outpath = path;

            var fileProviders = _staticFileOptions;
            if (fileProviders != null)
            {
                for (var index = 0; index < fileProviders.Length; index++)
                {
                    var item = fileProviders[index];

                    if (path.StartsWith(item.RequestPath, StringComparison.Ordinal))
                    {
                        outpath = path.Substring(item.RequestPath.Value.Length, path.Length - item.RequestPath.Value.Length);

                        return item.FileProvider;
                    }
                }
            }

            return _webRootFileProvider;
        }
    }
}
