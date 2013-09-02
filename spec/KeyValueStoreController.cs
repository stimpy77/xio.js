using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using Newtonsoft.Json.Linq;

namespace xio.js.spec
{
    public class KeyValueStoreController : ApiController
    {
        static Dictionary<string, object> _values = new Dictionary<string, object>(); 

        public object Get(string key)
        {
            return Get(key, "GET");
        }
        public object Get(string key, string method)
        {
            switch (method)
            {
                case "DELETE":
                    Delete(key);
                    return null;
                case "GET":
                    return _values[key];
                default:
                    throw new ArgumentException("method");
            }
        }

        public string Post(string key, [FromBody]JObject value)
        {
            // since "0" is an invalid key as is null or empty string, treat both as though a new key is needed
            if (key == null || key == "0" || key == "")
            {
                key = (new Random()).Next(100000000).ToString();
            
            }

            // since this key/value store API is being used with either a value or a model,
            // identify if value and store just the value; 
            // this is just a local hack for Newtonsoft / JObject
            if (value.Properties().Count() == 1 && value.Properties().First().Value.ToString() == "")
            {
                var val = value.Properties().First().Name;
                if (val.StartsWith("\"") && val.EndsWith("\"")) val = val.Substring(1, val.Length - 2);
                _values.Add(key, val);
            }

            else _values.Add(key, value);
            return key; // return the key, whether provided or generated
        }

        public void Put(string key, object value)
        {
            if (!_values.ContainsKey(key)) throw new ArgumentException("Key not found", "key");
            _values[key] = value;
        }

        public object Patch(string key, object value)
        {
            var dynval = (dynamic) value;
            var item = (dynamic)_values[key];
            foreach (var field in dynval.Keys)
            {
                item[field] = dynval[field];
            }
            return item;
        }

        public void Delete(string key)
        {
            _values.Remove(key);
        }
    }
}